import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

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


      <Image
        style={styles.image}
        source={require('../../assets/images/mundoAzul-removebg-preview.png')}
      />

      <Text style={styles.title}>CONHEÇA</Text>
      <Text style={styles.title2}>O MUNDO</Text>

            <Text style={styles.titlemini}>Explore. Descubra.{" "}
    <Text style={styles.titlemini2}>Viaje.</Text></Text>




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
        <Text style={styles.link}>Ainda não tem conta? {" "}
    <Text style={styles.link2}>Cadastre-se</Text></Text>
      </TouchableOpacity>

    </View>
  );
}

export default loginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d8edff',
    flex: 1,
    justifyContent: 'center',
    padding: 65
  },

  title: {
    fontSize: 35,
    
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#09245c'

    
  },

  title2: {
    fontSize: 35,
    marginBottom:40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#091c5c'


    
  },

   titlemini: {
    fontSize: 17,
    marginBottom:40,
    textAlign: 'center',
    color: '#09245c'

    
  },

 titlemini2: {
    fontSize: 19,
    marginBottom:40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#059600'

    
  },

  image: {
    width: 320,
    height: 320,
    borderRadius: 100,
    alignSelf: 'center',
  

  },

  input: {
    backgroundColor: '#dedede',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
     borderColor: '#171f35',
    borderWidth: 1,
    
  },

  button: {
    backgroundColor: '#2F6FDB', 
    padding: 12,
    marginBottom: 18,
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
    color: '#2F6FDB',
  }

});