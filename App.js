import * as React from 'react';
import { View, Text, StatusBar as RNStatusBar, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';

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

import { colors } from './src/styles/colors';
import { theme } from './src/styles/theme';
import './src/config/firebase';

const Stack = createNativeStackNavigator();

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44;

const renderHeader = (navigation, showBackButton = false, title = 'ACHADOS E PERDIDOS') => (
  <View
    style={{
      height: 60 + STATUSBAR_HEIGHT,
      paddingTop: STATUSBAR_HEIGHT,
      backgroundColor: colors.green_primary,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 5,
      position: 'relative',
    }}
  >
    {showBackButton && (
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: 16,
          top: STATUSBAR_HEIGHT + 14,
          zIndex: 10,
        }}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
    )}
    <Text style={theme.typography.headerTitle}>{title}</Text>
  </View>
);

function App() {
  const [fontsLoaded] = useFonts({
    MontserratSemiBold: Montserrat_600SemiBold,
    MontserratBold: Montserrat_700Bold,
    MontserratExtraBold: Montserrat_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.green_primary} />
      </View>
    );
  }

  return (
    <KeyboardProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.green_primary} translucent={true} />

        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={({ navigation }) => ({ 
              header: () => renderHeader(navigation, true) 
            })} 
          />
          <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CadastrarItem" component={CadastrarItemScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="EditarItem" component={EditarItemScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="ItemFullScreen" component={ItemFullScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EscolherImagem" component={EscolherImagemScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="EscolherImagemEditar" component={EscolherImagemEditarScreen} options={({ navigation }) => ({ header: () => renderHeader(navigation) })} />
          <Stack.Screen name="MinhasPublicacoes" component={MinhasPublicacoesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
      </KeyboardProvider>
  );
}

export default App;