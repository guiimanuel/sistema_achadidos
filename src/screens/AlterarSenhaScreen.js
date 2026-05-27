import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {Text,View,Image,TextInput,TouchableOpacity,StyleSheet} from 'react-native';
import { useState } from 'react';
import {getAuth,updatePassword} from "firebase/auth";

function loginScreen({ navigation }) {


  const [novaSenha, setNovaSenha] = useState('');


  const auth = getAuth();

  async function alterarSenha() {

    try {

   
      const user = auth.currentUser;

      
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

    
      await updatePassword(user, novaSenha);

      alert('Senha alterada com sucesso!');

    } catch (error) {

      console.log(error);

      alert(error.message);
    }
  }

  return (
    <View style={styles.container}>

      <StatusBar style="auto" />

      <Image
        style={styles.image}
        source={require('../../assets/images/contatos.png')}
      />

      <Text style={styles.title}>Daiane Santos</Text>

      <Text style={styles.title2}>
        dai@gmail.com
      </Text>

      
      <TextInput
        style={styles.input}
        placeholder="Digite a nova senha"
        secureTextEntry={true}
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      
      <TouchableOpacity
        style={styles.button}
        onPress={alterarSenha}
      >
        <Text style={styles.buttonText}>
          Alterar senha
        </Text>
      </TouchableOpacity>

    </View>
  );
}

export default loginScreen;

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    padding: 65
  },

  title: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#09245c'
  },

  title2: {
    fontSize: 20,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#091c5c'
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20
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
  }

});
