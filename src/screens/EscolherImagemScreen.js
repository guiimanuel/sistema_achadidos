import React from "react";
import {
  Alert,
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

const MAX_IMAGE_DATA_URL_LENGTH = 800000;
const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [4, 3],
  base64: true,
  quality: 0.25,
};

function EscolherImagem({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const origem = route?.params?.origem || "CadastrarItem";

  function retornarImagem(asset) {
    if (!asset?.base64) {
      Alert.alert("Imagem inválida", "Não foi possível carregar os dados da imagem.");
      return;
    }

    const mimeType = asset.mimeType || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${asset.base64}`;

    if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      Alert.alert(
        "Imagem muito grande",
        "Escolha uma imagem menor ou tire outra foto para caber no cadastro."
      );
      return;
    }

    // Navegação corrigida sem o aviso (warning) amarelo
    navigation.navigate(origem, { imagemRecebida: dataUrl });
  }

  async function escolherGaleria() {
    // 1. Obter status atual das permissões
    let status = await ImagePicker.getMediaLibraryPermissionsAsync();

    // 2. Se não foi concedido ainda, solicitar permissão
    if (!status.granted) {
      status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    // 3. Se negado permanentemente ou sem permissão
    if (!status.granted) {
      if (!status.canAskAgain) {
        Alert.alert(
          "Permissão Negada",
          "O acesso à galeria foi bloqueado nas configurações do dispositivo. Deseja abrir as configurações para permitir?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Configurações", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert("Permissão necessária", "Permita o acesso às fotos para escolher uma imagem.");
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      retornarImagem(result.assets[0]);
    }
  }

  async function tirarFoto() {
    // 1. Obter status atual das permissões de câmera
    let status = await ImagePicker.getCameraPermissionsAsync();

    // 2. Se não foi concedido ainda, solicitar permissão
    if (!status.granted) {
      status = await ImagePicker.requestCameraPermissionsAsync();
    }

    // 3. Se negado permanentemente ou sem permissão
    if (!status.granted) {
      if (!status.canAskAgain) {
        Alert.alert(
          "Permissão Negada",
          "O acesso à câmera foi bloqueado nas configurações do dispositivo. Deseja abrir as configurações para permitir?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Configurações", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert("Permissão necessária", "Permita o acesso à câmera para tirar uma foto.");
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      retornarImagem(result.assets[0]);
    }
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom + 12, 24) },
        ]}
      >
        <View style={styles.dragIndicator} />

        <Text style={styles.sheetTitle}>Adicionar Foto</Text>
        <Text style={styles.sheetSubtitle}>
          Selecione de onde quer escolher a imagem do item
        </Text>

        <View style={styles.optionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.optionButtonPressed,
            ]}
            onPress={tirarFoto}
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
