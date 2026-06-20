import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import AntDesign from '@expo/vector-icons/AntDesign';

function PerfilScreen({ navigation }) {

  const auth = getAuth();

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

        <Text style={styles.title}> {auth.currentUser?.email}</Text>

        {/*funcao logout*/}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AlterarSenhaScreen')}
        >
          <Text style={styles.buttonText}>
            <AntDesign name="lock" size={21} color="#161930" /> Alterar Senha
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={logoutUser}
        >

          <Text style={styles.buttonText2}>
            <AntDesign name="logout" size={20} color="#be0000" /> Logout
          </Text>

        </TouchableOpacity>

      </View>

      <View
        style={{
          height: 70,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          elevation: 10
        }}
      >

        <TouchableOpacity
          onPress={() => navigation.navigate('Convercao')}
          style={{
            alignItems: 'center'
          }}
        >
          <AntDesign
            name="home"
            size={24}
            color="gray"
          />

          <Text
            style={{
              fontSize: 12,
              marginTop: 4,
              color: 'gray'
            }}
          >
            Início
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: 'center'
          }}
        >
          <AntDesign
            name="staro"
            size={24}
            color="gray"
          />

          <Text
            style={{
              fontSize: 12,
              marginTop: 4,
              color: 'gray'
            }}
          >
            Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Perfil')}
          style={{
            alignItems: 'center'
          }}
        >
          <AntDesign
            name="user"
            size={24}
            color="#2F6FDB"
          />

          <Text
            style={{
              fontSize: 12,
              marginTop: 4,
              color: '#2F6FDB'
            }}
          >
            Perfil
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
    fontSize: 22,
    textAlign: 'center',
    color: '#161930',
    marginBottom: 30

  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 200,
    alignSelf: 'center',
    marginBottom: 10
  },

  button: {
    backgroundColor: '#F3F6FB',
    borderWidth: 2,
    padding: 14,
    marginBottom: 2,
    marginTop: 25,
    borderRadius: 8,
    borderColor: "#c0c0c0",
  },

  buttonText: {
    color: '#161930',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  buttonText2: {
    color: '#be0000',
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