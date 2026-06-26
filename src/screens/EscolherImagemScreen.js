import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function EscolherImagem({ navigation, route }) {
  
  const origem = route?.params?.origem || "CadastrarItem";

  async function escolherGaleria() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      
      navigation.navigate(origem, {
        imagemRecebida: result.assets[0].uri,
      });
    }
  }

  async function tirarFoto() {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      navigation.navigate(origem, {
        imagemRecebida: result.assets[0].uri,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {origem === "EditarItem" ? "Editar Item" : "Cadastrar Item"}
      </Text>

      <View style={styles.modal}>
        <TouchableOpacity style={styles.option} onPress={tirarFoto}>
          <Text>📷 Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={escolherGaleria}>
          <Text>🖼 Carregar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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