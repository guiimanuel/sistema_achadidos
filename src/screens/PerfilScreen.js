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
    <View style={styles.mainContainer}>
      <StatusBar style="light" />

      {/* HEADER SUPERIOR VERDE */}
      <View style={styles.header}>
        {/* Botão para voltar à tela anterior facilmente */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Meu Perfil
        </Text>
        
        {/* View vazia apenas para centralizar o título perfeitamente com o botão de voltar */}
        <View style={{ width: 24 }} />
      </View>

      {/* CONTEÚDO CENTRAL */}
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require('../../assets/images/fotoperfil.png')}
        />

        <Text style={styles.emailText}>
          {auth.currentUser?.email || "Usuário não logado"}
        </Text>

        {/* BOTÃO ALTERAR SENHA */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AlterarSenhaScreen')}
        >
          <Text style={styles.buttonText}>
            <AntDesign name="lock" size={21} color="#009933" /> Alterar Senha
          </Text>
        </TouchableOpacity>

        {/* BOTÃO LOGOUT */}
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={logoutUser}
        >
          <Text style={styles.logoutButtonText}>
            <AntDesign name="logout" size={20} color="#be0000" /> Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PerfilScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  header: {
    backgroundColor: '#009933', // Verde padrão do seu App Bar
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 35,
  },
  emailText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#161930',
    marginBottom: 40,
    fontWeight: '500',
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#009933', // Borda verde combinando com a logo
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#009933', // Texto verde
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    borderColor: '#be0000', // Borda vermelha para o logout
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#be0000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});