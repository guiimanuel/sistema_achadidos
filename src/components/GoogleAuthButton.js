import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { entrarComGoogle, mensagemErroGoogle, prepararGoogleWeb } from '../services/googleAuth.js';
import { AppAlert } from '../services/alerts.js';
import { colors } from '../styles/colors.js';

export default function GoogleAuthButton({ navigation, cadastro = false, disabled = false, onBusyChange }) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [ready, setReady] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let active = true;
    prepararGoogleWeb().catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  async function entrar() {
    if (disabled || !ready || lock.current) return;
    lock.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try {
      const credential = await entrarComGoogle({ cadastro });
      if (credential) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      AppAlert.alert('Acesso com Google', mensagemErroGoogle(error), undefined,
        error.code === 'google/sign-in-incomplete' ? {} : { variant: 'error' });
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy || !ready, busy }}
      disabled={disabled || busy || !ready} onPress={entrar} style={[styles.button, (disabled || busy || !ready) && styles.disabled]}>
      {busy ? <ActivityIndicator color={colors.green_primary} /> : <Ionicons name="logo-google" size={21} color={colors.green_primary} />}
      <Text style={styles.label}>{busy ? 'Conectando...' : cadastro ? 'Cadastrar-se com Google' : 'Entrar com Google'}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 52, padding: 14, borderWidth: 1, borderColor: colors.green_primary, borderRadius: 8,
    backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginVertical: 16 },
  label: { color: colors.green_primary, fontFamily: 'MontserratSemiBold', fontSize: 14 },
  disabled: { opacity: 0.6 },
});
