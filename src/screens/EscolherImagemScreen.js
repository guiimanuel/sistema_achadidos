import { AppAlert as Alert } from '../services/alerts.js';
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../styles/colors";
import { prepararImagem } from '../services/imagens.js';
import { cameraExternaIndisponivel } from '../utils/camera.js';

const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: false,
  base64: false,
  quality: 1,
};

function EscolherImagem({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const origem = route?.params?.origem || "CadastrarItem";
  const [processando, setProcessando] = useState(false);
  const mounted = useRef(true);
  const abrindoSeletor = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function retornarImagem(asset) {
    setProcessando(true);
    try {
      const dataUrl = await prepararImagem(asset);
      if (mounted.current) navigation.navigate(origem, { imagemRecebida: dataUrl });
    } catch (error) {
      if (mounted.current) Alert.alert('Imagem inválida', error.message || 'Não foi possível preparar a imagem.', undefined, { variant: 'error' });
    } finally {
      if (mounted.current) setProcessando(false);
    }
  }

  async function selecionarImagem(usarCamera) {
    if (abrindoSeletor.current) return;
    abrindoSeletor.current = true;
    setProcessando(true);
    try {
      let status = usarCamera
        ? await ImagePicker.getCameraPermissionsAsync()
        : await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!status.granted && status.canAskAgain) {
        status = usarCamera
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!mounted.current) return;
      if (!status.granted) {
        const acesso = usarCamera ? 'câmera' : 'galeria';
        if (!status.canAskAgain) {
          Alert.alert('Permissão necessária', 'Permita o acesso à ' + acesso + ' nas configurações do dispositivo.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configurações', onPress: () => Linking.openSettings().catch(() => Alert.alert('Aviso', 'Não foi possível abrir as configurações.', undefined, { variant: 'error' })) },
          ]);
        } else {
          Alert.alert('Permissão necessária', 'Permita o acesso à ' + acesso + ' para adicionar uma foto.');
        }
        return;
      }
      const result = usarCamera
        ? await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
      if (mounted.current && !result.canceled) await retornarImagem(result.assets?.[0]);
    } catch (error) {
      if (!mounted.current) return;
      if (usarCamera && cameraExternaIndisponivel(error)) {
        navigation.navigate('CameraItem', { origem });
      } else {
        Alert.alert(usarCamera ? 'Câmera indisponível' : 'Galeria indisponível',
          usarCamera ? 'Não foi possível abrir a câmera. Tente novamente ou selecione uma foto da galeria.' : 'Não foi possível abrir a galeria. Tente novamente.', undefined, { variant: 'error' });
      }
    } finally {
      abrindoSeletor.current = false;
      if (mounted.current) setProcessando(false);
    }
  }

  const escolherGaleria = () => selecionarImagem(false);
  const tirarFoto = () => selecionarImagem(true);

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} disabled={processando} onPress={() => navigation.goBack()} />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom + 12, 24) },
        ]}
      >
        <View style={styles.dragIndicator} />

        <Text style={styles.sheetTitle}>Adicionar Foto</Text>
        <Text style={styles.sheetSubtitle} accessibilityLiveRegion="polite">
          {processando ? 'Preparando foto em alta qualidade...' : 'Selecione de onde quer escolher a imagem do item'}
        </Text>

        <View style={styles.optionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.optionButtonPressed,
            ]}
            onPress={tirarFoto}
            disabled={processando}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={26} color={colors.green_primary} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Tirar Foto</Text>
              <Text style={styles.optionDescription}>Use a câmera do seu celular</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray_icon} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.optionButtonPressed,
            ]}
            onPress={escolherGaleria}
            disabled={processando}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="images-outline" size={26} color={colors.green_primary} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Carregar da Galeria</Text>
              <Text style={styles.optionDescription}>Escolha uma foto salva no dispositivo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray_icon} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.cancelButtonPressed,
          ]}
          onPress={() => navigation.goBack()}
          disabled={processando}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default EscolherImagem;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18, 26, 20, 0.55)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dragIndicator: {
    width: 38,
    height: 5,
    backgroundColor: "#e0e5dd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    color: colors.text_heading,
    fontFamily: "MontserratBold",
    textAlign: "center",
    includeFontPadding: false,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.text_subtle,
    fontFamily: "MontserratMedium",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    includeFontPadding: false,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f8f4",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e4ebe2",
  },
  optionButtonPressed: {
    backgroundColor: "#e8f2e6",
    borderColor: "#c8dbc5",
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0ebd8",
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 15,
    color: colors.text_heading,
    fontFamily: "MontserratSemiBold",
    includeFontPadding: false,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.text_subtle,
    fontFamily: "MontserratMedium",
    marginTop: 2,
    includeFontPadding: false,
  },
  cancelButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  cancelButtonPressed: {
    backgroundColor: "#fde8e8",
  },
  cancelText: {
    color: "#dc2626",
    fontSize: 15,
    fontFamily: "MontserratBold",
    includeFontPadding: false,
  },
});
