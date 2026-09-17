import * as React from 'react';
<<<<<<< Updated upstream
import { View, Text } from 'react-native';
=======

import { View, Text } from 'react-native';

import { StatusBar } from 'expo-status-bar';

>>>>>>> Stashed changes
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
<<<<<<< Updated upstream
=======



>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
import { colors } from './src/components/colors';
import { useExpoFonts } from './src/components/expoFonts';
=======



import { colors } from './src/components/colors';

import { useExpoFonts } from './src/components/expoFonts';

>>>>>>> Stashed changes
import './src/utils/firebase';



const Stack = createNativeStackNavigator();

<<<<<<< Updated upstream
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
          name="ItemFullScreen"
          component={ItemFullScreen}
          options={{
            headerShown: false,
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
            headerShown: false,
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
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
=======


function App() {

  const { fontsLoaded, fontError } = useExpoFonts();



  if (!fontsLoaded) {

    return null;

  }



  return (

    <NavigationContainer>

      {/* Configuração global da StatusBar para ícones brancos e fundo verde no Android */}

      <StatusBar style="light" backgroundColor={colors.green_primary} translucent={true} />



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

          name="ItemFullScreen"

          component={ItemFullScreen}

          options={{

            headerShown: false,

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

            headerShown: false,

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

            headerShown: false,

          }}

        />

      </Stack.Navigator>

    </NavigationContainer>

>>>>>>> Stashed changes
  );

}





export default App;
