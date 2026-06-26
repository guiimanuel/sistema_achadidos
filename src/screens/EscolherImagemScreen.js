import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

const MAX_IMAGE_DATA_URL_LENGTH = 800000;
const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [4, 3],
  base64: true,
  quality: 0.25,
};

function EscolherImagem({ navigation, route }) {
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

    navigation.navigate({
      name: origem,
      params: { imagemRecebida: dataUrl },
      merge: true,
    });
  }

  async function escolherGaleria() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita o acesso às fotos para escolher uma imagem.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      retornarImagem(result.assets[0]);
    }
  }

  async function tirarFoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita o acesso à câmera para tirar uma foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      retornarImagem(result.assets[0]);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {origem === "EditarItem" ? "Editar Item" : "Cadastrar Item"}
      </Text>

      <View style={styles.modal}>
        <TouchableOpacity style={styles.option} onPress={tirarFoto}>
          <Text>Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={escolherGaleria}>
          <Text>Carregar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default EscolherImagem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: "green",
    color: "#fff",
    padding: 15,
    textAlign: "center",
  },
  modal: {
    marginTop: "auto",
    backgroundColor: "#fff",
    padding: 20,
  },
  option: {
    padding: 20,
    borderBottomWidth: 1,
  },
  cancelar: {
    textAlign: "center",
    marginTop: 10,
  },
});
