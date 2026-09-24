import * as React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';

import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
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

// ===============================
// HEADER COMPONENTE COM SAFE AREA
// ===============================

const CustomHeader = ({ navigation, showBackButton = false, title = 'ACHADOS E PERDIDOS' }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.green_primary,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 60 + insets.top,
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
            top: insets.top + 12,
            zIndex: 10,
          }}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      <Text style={[theme.typography.headerTitle, { marginBottom: 10 }]}>
        {title}
      </Text>
    </View>
  );
};

// ===============================
// APP
// ===============================

function App() {
  const [fontsLoaded] = useFonts({
    MontserratSemiBold: Montserrat_600SemiBold,
    MontserratBold: Montserrat_700Bold,
    MontserratExtraBold: Montserrat_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.green_primary} />
      </View>
    );
  }

  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />

        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            {/* LOGIN */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={({ navigation }) => ({
                header: () => (
                  <CustomHeader navigation={navigation} showBackButton={true} />
                ),
              })}
            />

            {/* ALTERAR SENHA */}
            <Stack.Screen
              name="AlterarSenha"
              component={AlterarSenhaScreen}
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} />,
              })}
            />

            {/* CADASTRO */}
            <Stack.Screen
              name="Cadastro"
              component={CadastroScreen}
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} />,
              })}
            />

            {/* HOME */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* CADASTRAR ITEM */}
            <Stack.Screen
              name="CadastrarItem"
              component={CadastrarItemScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* EDITAR ITEM */}
            <Stack.Screen
              name="EditarItem"
              component={EditarItemScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* ITEM FULL SCREEN */}
            <Stack.Screen
              name="ItemFullScreen"
              component={ItemFullScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* ESCOLHER IMAGEM */}
            <Stack.Screen
              name="EscolherImagem"
              component={EscolherImagemScreen}
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} />,
              })}
            />

            {/* ESCOLHER IMAGEM EDITAR */}
            <Stack.Screen
              name="EscolherImagemEditar"
              component={EscolherImagemEditarScreen}
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} />,
              })}
            />

            {/* MINHAS PUBLICAÇÕES */}
            <Stack.Screen
              name="MinhasPublicacoes"
              component={MinhasPublicacoesScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* PERFIL */}
            <Stack.Screen
              name="Perfil"
              component={PerfilScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}

export default App;