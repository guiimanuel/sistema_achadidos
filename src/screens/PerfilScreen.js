import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

function PerfilScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const auth = getAuth();

  const signInUser = () => {

    signInWithEmailAndPassword(auth, email, senha)

      .then((userCredential) => {

        const user = userCredential.user;

        navigation.navigate('Convercao', { user });

      })

      .catch(() => {
        alert('Email ou senha inválidos!');
      });

  };

  const logoutUser = () => {

    signOut(auth)

      .then(() => {

        navigation.navigate('login');

      })

      .catch((error) => {

        alert('Erro ao sair');

        console.log(error);

      });

  };

  return (

    <View style={{
      flex: 1,
      backgroundColor: '#F3F6FB'
    }}>

      <View style={{
        backgroundColor: '#2F6FDB',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
      }}>

        <Text style={{
          color: '#fff',
          fontSize: 26,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Meu Perfil
        </Text>
      </View>

      <View style={styles.container}>

        <StatusBar style="auto" />

        <Image
          style={styles.image}
          source={require('../../assets/images/fotoperfil.png')}
        />

        <Text style={styles.title}>email aqui</Text>

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

        {/*funcao logout*/}
        <TouchableOpacity
          style={styles.button}
          onPress={logoutUser}
        >

          <Text style={styles.buttonText}>
            Logout
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cadastro')}
        >

          <Text style={styles.link}>
            Ainda não tem conta?{" "}

            <Text style={styles.link2}>
              Cadastre-se
            </Text>

          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );
}

export default PerfilScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 35
  },

  title: {
    fontSize: 35,
    textAlign: 'center',
  
    color: '#09245c'
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 200,
    alignSelf: 'center',
    marginBottom: 10
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
    backgroundColor: '#ff3b30',
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
    color: '#2F6FDB',
  }

});