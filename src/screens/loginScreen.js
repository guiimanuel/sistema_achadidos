import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function loginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const auth = getAuth();
  const signInUser = () => {
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigation.navigate('initial', user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <View>
      <StatusBar style="auto" />

      <View>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 30,
            color: '#263466'
          }}>
          Seja Bem-Vindo!
        </Text>
      </View>
      {/*Foto perfil*/}
      <View
        style={{
          margin: 'auto',
          marginTop: 50,
          marginBottom: 40
        }}>
        <Image
          style={{
            width: 100,
            height: 100,
            borderRadius: 50
          }}
          source={require('../../assets/images/fotoperfil.png')}
        />
      </View>


      {/*Email*/}
      <View
        style={{
          marginLeft: 30,
          marginRight: 30,
          marginBottom: 15,
          alignItems: 'left',
          gap: 3,
        }}>


        <Text
          style={{
            fontSize: 16,
            textAlign: 'left',
            fontWeight: '600'
          }}>
          Email
        </Text>
        <TextInput
          style={{
            fontSize: 14,
            height: 50,
            backgroundColor: '#00000018',
            borderWidth: 3,
            borderRadius: 10,
            borderColor: '#263066',
            fontWeight: 500
          }}
          keyboardType='email-address'
          value={email}
          onChangeText={setEmail}
          placeholder='Digite seu email...' />
      </View>


      {/*Senha*/}
      <View
        style={{
          marginLeft: 30,
          marginRight: 30,
          marginBottom: 15,
          alignItems: 'left',
          gap: 3,
        }}>
        <Text
          style={{
            fontSize: 16,
            textAlign: 'left',
            fontWeight: '600'
          }}>
          Senha
        </Text>
        <TextInput
          style={{
            fontSize: 14,
            height: 50,
            backgroundColor: '#00000018',
            borderWidth: 3,
            borderRadius: 10,
            borderColor: '#263066',
            fontWeight: 500
          }}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          placeholder='Digite sua senha...'
        />
      </View>


      {/*Buttons*/}
      <View style={{
        cursor: 'pointer',
        marginTop: 15,
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 10,
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#263466',
            borderRadius: 10,
            padding: 10,
          }}
          onPress={signInUser}>

          <Text style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Login
          </Text>

        </TouchableOpacity>

      </View>

      <View
        style={{
          cursor: 'pointer',
          marginLeft: 30,
          marginRight: 30,
          marginBottom: 15,
        }}>

        <TouchableOpacity
          style={{
            backgroundColor: '#263466',
            borderRadius: 10,
            padding: 10,
          }}
          onPress={() => {
            navigation.navigate('register');
          }}
        >

          <Text style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Cadastre-se
          </Text>

        </TouchableOpacity>
      </View>


    </View>
  );
}
export default loginScreen;