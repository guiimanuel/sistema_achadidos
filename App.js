import * as React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import AlterarSenhaScreen from './src/screens/AlterarSenhaScreen';
import HomeScreen from './src/screens/HomeScreen';
import CadastrarItemScreen from './src/screens/CadastrarItemScreen';
import EditarItemScreen from './src/screens/EditarItemScreen';
import ItemFullScreen from './src/screens/ItemFullScreen';
import EscolherImagemScreen from './src/screens/EscolherImagemScreen';
import EscolherImagemEditarScreen from './src/screens/EscolherImagemEditarScreen';
import MinhasPublicacoesScreen from './src/screens/MinhasPublicacoesScreen';
import PerfilScreen from './src/screens/PerfilScreen';

import { colors } from './src/components/colors';
import { useExpoFonts } from './src/components/expoFonts';
import './src/utils/firebase';

const Stack = createNativeStackNavigator();

function CustomHeader({ title = 'ACHADOS E PERDIDOS' }) {
  return (
    <View
      style={{
        height: 120,
        paddingTop: 40,
        backgroundColor: colors.green_primary,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 19, fontFamily: 'MontserratBold' }}>
        {title}
      </Text>
    </View>
  );
}

export default function App() {
  const { fontsLoaded, fontError } = useExpoFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.green_primary} translucent={true} />

      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="AlterarSenha"
          component={AlterarSenhaScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CadastrarItem"
          component={CadastrarItemScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="EditarItem"
          component={EditarItemScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="ItemFullScreen"
          component={ItemFullScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EscolherImagem"
          component={EscolherImagemScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="EscolherImagemEditar"
          component={EscolherImagemEditarScreen}
          options={{ header: () => <CustomHeader /> }}
        />
        <Stack.Screen
          name="MinhasPublicacoes"
          component={MinhasPublicacoesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
