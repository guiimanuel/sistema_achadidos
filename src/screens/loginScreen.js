import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function loginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const auth = getAuth();

  const signInUser = () => {
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.navigate('Convercao', user);
      })
      .catch(() => {
        alert('Email ou senha inválidos!');
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Realize seu Login:</Text>

      <Image
        style={styles.image}
        source={require('../../assets/images/fotoperfil.png')}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#8a8a8a"

      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholderTextColor="#8a8a8a"

      />

      <TouchableOpacity style={styles.button} onPress={signInUser}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Cadastrar-se</Text>
      </TouchableOpacity>

    </View>
  );
}

export default loginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 65
  },

  title: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: 'center',
    
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 90,

  },

  input: {
    backgroundColor: '#dedede',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8
  },

  button: {
    backgroundColor: '#2F6FDB', 
    padding: 12,
    marginBottom: 18,
        marginTop: 30,

  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
     fontWeight: 'bold',
  },

  link: {
    textAlign: 'left',
    color: '#2F6FDB' 
  }
});