import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

function registerScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const auth = getAuth();
  const registerUser = () => {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigation.goBack()
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert('Erro ao cadastrar usuário');
        // ..
      })
  };

  return (
    <View>
      <StatusBar style="auto" />

      <View
        style={{
          marginTop: 50,
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
            borderColor: '#263466',
            fontWeight: 500
          }}
          value={email}
          onChangeText={setEmail}
          placeholder='Digite seu email...' />
      </View>

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
            borderColor: '#263466',
            fontWeight: 500
          }}
          value={senha}
          onChangeText={setSenha}
          placeholder='Digite sua senha...' />
      </View>

      <View
        style={{
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
            padding: 10
          }}
          onPress={registerUser}
        >
          <Text style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Cadastrar
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
export default registerScreen;