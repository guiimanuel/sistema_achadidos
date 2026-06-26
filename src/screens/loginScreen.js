import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');


  const signInUser = () => {
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        navigation.navigate('MinhasPublicacoes', userCredential.user);
      })
      .catch(() => alert('Email ou senha inválidos!'));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Image style={styles.image} source={require('../../assets/images/caixa.png')} />

      <Text style={styles.title}>BEM VINDO</Text>

      <TextInput
        placeholder="Email institucional..."
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha..."
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.button} onPress={signInUser}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text>Cadastre-se</Text>
      </TouchableOpacity>

       <TouchableOpacity onPress={() => navigation.navigate('AlterarSenhaScreen')}>
        <Text style={styles.link}>Esqueceu a senha? {" "}
    <Text style={styles.link2}>Alterar</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fcfaf7',
    flex: 1,
    justifyContent: 'center',
    padding: 65
  },

  title: {
    fontSize: 34,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#059600'

    
  },



   titlemini: {
    fontSize: 17,
    marginBottom:100,
    textAlign: 'center',
    color: '#059600'

    
  },

 titlemini2: {
    fontSize: 17,
    marginBottom:100,
    textAlign: 'center',
    color: '#059600'

    
  },

  image: {
    width: 250,
    height: 184,
  
    alignSelf: 'center',
  

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
    backgroundColor: '#059600', 
    padding: 12,
    marginBottom: 11,
        marginTop: 30,
        borderRadius: 8

  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
     fontWeight: 'bold',
  },

  link: {
    textAlign: 'left',
    color: '#000000',
 

  },

   link2: {
    textAlign: 'left',
    color: '#059600',
        fontSize: 15,

  }

});