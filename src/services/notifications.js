import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { fetch } from 'expo/fetch';

// Importing this module starts native push listeners, which Expo Go cannot support.
const Notifications = Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient'
  ? require('expo-notifications')
  : null;

const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yxntmaturcrogmkbijql.supabase.co';
const STORAGE_KEY = '@achadidos/push-v1';
let serial = Promise.resolve();
let generation = 0;

const supported = () => Platform.OS !== 'web' && Device.isDevice && Constants.executionEnvironment !== 'storeClient';
const report = () => console.warn('Notificações: sincronização pendente; será tentada novamente.');
const exclusive = (task) => {
  const result = serial.then(task);
  serial = result.catch(() => {});
  return result;
};
const readState = async () => JSON.parse(await AsyncStorage.getItem(STORAGE_KEY) || '{"pending":[]}');
const saveState = (state) => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

async function request(action, body = {}, user = null) {
  const jwt = user ? await user.getIdToken() : null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/functions/v1/push-api`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify({ action, ...body }),
    });
    if (!response.ok) throw new Error(`Push HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

async function queueRemoval(state) {
  if (!state.device) return;
  if (!state.pending.includes(state.device.session)) state.pending.push(state.device.session);
  delete state.device;
  await saveState(state);
}

async function flushRemovals(state) {
  // A capability only disables its own installation; no Firebase session is needed.
  for (const session of [...state.pending]) {
    await request('deactivate', { session });
    state.pending = state.pending.filter((value) => value !== session);
    await saveState(state);
  }
}

async function synchronize(version, refreshRegistration = false, user = null) {
  if (!supported()) return;
  const state = await readState();
  await flushRemovals(state);
  if (version !== generation) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('novos-itens', {
      name: 'Novos itens publicados', importance: Notifications.AndroidImportance.HIGH,
      sound: 'default', vibrationPattern: [0, 250, 250, 250],
    });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (permission.status === 'undetermined' && permission.canAskAgain && !state.asked) {
    state.asked = true;
    await saveState(state);
    permission = await Notifications.requestPermissionsAsync();
  }
  const allowed = permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) {
    await queueRemoval(state);
    await flushRemovals(state);
    return;
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Project ID Expo ausente');
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (version !== generation) return;
  if (state.device && state.device.token !== token) {
    await queueRemoval(state);
    await flushRemovals(state);
  }
  if (!state.device) {
    // Persist the revocation capability before activation: a lost response cannot orphan a device.
    const { session } = await request('session', { projectId });
    state.device = { session, token };
    await saveState(state);
  }
  if (version !== generation) return;
  if (state.device.synced && !refreshRegistration) return;
  await request('register', { session: state.device.session, token, platform: Platform.OS, projectId }, user);
  state.device.synced = true;
  await saveState(state);
}

export function acompanharNotificacoes(user = null) {
  const version = ++generation;
  if (supported()) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true, shouldShowList: true,
        shouldPlaySound: true, shouldSetBadge: false,
      }),
    });
  }
  const sync = (refresh = false) => exclusive(() => synchronize(version, refresh, user)).catch(report);
  void sync(true);
  const appListener = AppState.addEventListener('change', (state) => { if (state === 'active') void sync(true); });
  const tokenListener = supported() ? Notifications.addPushTokenListener(() => { void sync(true); }) : null;
  const retry = setInterval(() => { if (AppState.currentState === 'active') void sync(); }, 60000);
  return () => {
    ++generation;
    clearInterval(retry);
    appListener.remove();
    tokenListener?.remove();
  };
}

export async function desativarNotificacoes() {
  ++generation;
  await exclusive(async () => {
    const state = await readState();
    await queueRemoval(state);
    await flushRemovals(state);
  }).catch(report);
}

export async function notificarNovaPublicacao(itemId, user) {
  // The Firestore scanner recovers a failed request independently of the author's app.
  await request('publish', { itemId }, user).catch(report);
}

export async function notificarContato(itemId, user, collection = 'itens') {
  if (user?.emailVerified) return request('contact', { itemId, collection }, user);
  const session = await exclusive(async () => {
    const state = await readState();
    if (!state.contactSession) {
      state.contactSession = (await request('session')).session;
      await saveState(state);
    }
    return state.contactSession;
  });
  return request('contact', { itemId, collection, session });
}

export function observarToquesNotificacao(callback) {
  if (!supported()) return () => {};
  const listener = Notifications.addNotificationResponseReceivedListener(callback);
  const previous = Notifications.getLastNotificationResponse();
  if (previous) callback(previous);
  return () => listener.remove();
}

export async function limparToqueNotificacao() {
  if (supported()) await Notifications.clearLastNotificationResponseAsync();
}
