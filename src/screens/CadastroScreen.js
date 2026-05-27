import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function registerScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const auth = getAuth();

  const registerUser = () => {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error.code, error.message);
        alert('Erro ao cadastrar usuário');
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.title1}>Preencha os dados pra se cadastrar</Text>


      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Novo email"
        placeholderTextColor="#8a8a8a"
      />

      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Nova senha"
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



export default registerScreen;

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    justifyContent: 'center',
    padding: 65
  },

  title: {
    color: '#09245c',
    fontSize: 32,
    marginBottom: 10,
    fontWeight: 'bold',

  
  },

   title1: {
    color: '#09245c',
    fontSize: 15,
    marginBottom: 100,
    
    
  },


  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#171f35',
    borderWidth: 1,
  },

  button: {
    backgroundColor: '#2F6FDB',
    padding: 12,
    marginBottom: 10,
    marginTop: 30,
    borderRadius: 8,
  },

  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',

  },

  link: {
    textAlign: 'center',
    marginTop: 10,
    color: '#2F6FDB'
  }
});