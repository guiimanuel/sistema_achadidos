import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import AlterarSenhaScreen from './src/screens/AlterarSenhaScreen';
import HomeScreen from './src/screens/HomeScreen';
import CadastrarItemScreen from './src/screens/CadastrarItemScreen';
import EditarItemScreen from './src/screens/EditarItemScreen';
import EscolherImagemScreen from './src/screens/EscolherImagemScreen';
import EscolherImagemEditarScreen from './src/screens/EscolherImagemEditarScreen';
import MinhasPublicacoesScreen from './src/screens/MinhasPublicacoesScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import { colors } from './src/components/colors';
import { useExpoFonts } from './src/components/expoFonts';
import './src/utils/firebase';

const Stack = createNativeStackNavigator();

function App() {
  const { fontsLoaded, fontError } = useExpoFonts();
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="AlterarSenha"
          component={AlterarSenhaScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CadastrarItem"
          component={CadastrarItemScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  letterSpacing: 1.5, // Adiciona espaçamento entre as letras
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="EditarItem"
          component={EditarItemScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="EscolherImagem"
          component={EscolherImagemScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="EscolherImagemEditar"
          component={EscolherImagemEditarScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="MinhasPublicacoes"
          component={MinhasPublicacoesScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            header: () => (
              <View
                style={{
                  height: 120,
                  paddingTop: 40, // Espaço para a barra de status
                  backgroundColor: colors.green_primary,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
                  ACHADOS E PERDIDOS
                </Text>
              </View>
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
