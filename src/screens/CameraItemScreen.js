import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors.js';
import { AppAlert as Alert } from '../services/alerts.js';
import { prepararImagem } from '../services/imagens.js';

export default function CameraItemScreen({ navigation, route }) {
  const camera = useRef(null);
  const mounted = useRef(true);
  const takingPhoto = useRef(false);
  const focused = useIsFocused();
  const active = useRef(focused);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    active.current = focused;
    if (!focused) setReady(false);
  }, [focused]);

  async function permitirCamera() {
    try {
      if (permission?.canAskAgain === false) await Linking.openSettings();
      else await requestPermission();
    } catch {
      Alert.alert('Câmera indisponível', 'Não foi possível solicitar acesso à câmera. Você pode selecionar uma foto da galeria.', undefined, { variant: 'error' });
    }
  }

  async function fotografar() {
    if (!ready || takingPhoto.current || !camera.current) return;
    takingPhoto.current = true;
    setBusy(true);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 1 });
      if (!mounted.current || !active.current) return;
      const dataUrl = await prepararImagem(photo);
      if (mounted.current && active.current) {
        navigation.navigate(route?.params?.origem || 'CadastrarItem', { imagemRecebida: dataUrl });
      }
    } catch {
      if (mounted.current && active.current) {
        Alert.alert('Não foi possível tirar a foto', 'Tente novamente ou volte para selecionar uma imagem da galeria.', undefined, { variant: 'error' });
      }
    } finally {
      takingPhoto.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} disabled={busy} style={styles.back}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Tirar foto</Text>
        <View style={styles.back} />
      </View>
      {!permission ? <ActivityIndicator style={styles.preview} color={colors.white} /> : !permission.granted ? (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>Permita o acesso à câmera para fotografar o item.</Text>
          <Pressable style={styles.permissionButton} accessibilityRole="button" onPress={permitirCamera}>
            <Text style={styles.buttonText}>{permission.canAskAgain ? 'Permitir câmera' : 'Abrir configurações'}</Text>
          </Pressable>
        </View>
      ) : cameraError ? (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>Não foi possível iniciar a câmera. Volte para escolher uma foto da galeria.</Text>
        </View>
      ) : focused ? (
        <CameraView
          ref={camera}
          style={styles.preview}
          facing="back"
          mode="picture"
          onCameraReady={() => setReady(true)}
          onMountError={() => { setReady(false); setCameraError(true); }}
        />
      ) : <View style={styles.preview} />}
      <View style={styles.controls}>
        <Text style={styles.message} accessibilityLiveRegion="polite">{busy ? 'Preparando foto...' : 'Enquadre o item e toque para fotografar'}</Text>
        <Pressable
          style={[styles.capture, (!ready || busy || cameraError) && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Fotografar item"
          disabled={!ready || busy || cameraError || !focused}
          onPress={fotografar}
        >
          {busy ? <ActivityIndicator color={colors.green_primary} /> : <Ionicons name="camera" size={32} color={colors.green_primary} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.green_primary, paddingHorizontal: 12 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, paddingHorizontal: 8, textAlign: 'center', color: colors.white, fontFamily: 'MontserratBold', fontSize: 20 },
  preview: { flex: 1 },
  controls: { alignItems: 'center', padding: 16, gap: 14 },
  message: { color: colors.white, textAlign: 'center', fontFamily: 'MontserratMedium' },
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 20 },
  capture: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  permissionButton: { backgroundColor: colors.green_primary, padding: 14, borderRadius: 10 },
  buttonText: { color: colors.white, fontFamily: 'MontserratBold' },
});
