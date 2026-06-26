import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const registerUser = () => {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo.endsWith("@discente.ifpe.edu.br")) {
      Alert.alert("Erro", "Use apenas e-mail institucional");
      return;
    }

    createUserWithEmailAndPassword(auth, emailLimpo, senha)
      .then(() => {
        Alert.alert("Sucesso", "Conta criada!");
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error.code);
        Alert.alert("Erro", "Não foi possível cadastrar");
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>CRIAR CONTA</Text>

      <Text style={styles.subtitle}>Preencha os dados pra se cadastrar</Text>

      <Text style={styles.warning}>*Apenas email institucional</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Novo email..."
        placeholderTextColor="#8a8a8a"
      />

      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Nova senha..."
        placeholderTextColor="#8a8a8a"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={registerUser}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfaf7",
    justifyContent: "center",
    padding: 65
  },

  title: {
    textAlign: "center",
    color: "#059600",
    fontSize: 35,
    fontWeight: "bold"
  },

  subtitle: {
    textAlign: "center",
    color: "#059600",
    fontSize: 17,
    marginBottom: 80
  },

  warning: {
    color: "#8a8a8a",
    fontSize: 14,
    marginBottom: 10
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#171f35"
  },

  button: {
    backgroundColor: "#059600",
    padding: 12,
    marginTop: 30,
    borderRadius: 8
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#059600"
  }
});