import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import loginScreen from '../screens/loginScreen';
import ConvercaoScreen from '../screens/ConvercaoScreen';
import CadastroScreen from '../screens/CadastroScreen';
import AlterarSenhaScreen from '../screens/AlterarSenhaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import DetalharScreen from '../screens/DetalharScreen';




const Stack = createNativeStackNavigator();

function App() {

  const firebaseConfig = {
    apiKey: "AIzaSyDTDWpgvF0a7NAiazc6lfY6JpbAw7zPIVU",
    authDomain: "daju-c45eb.firebaseapp.com",
    projectId: "daju-c45eb",
    storageBucket: "daju-c45eb.firebasestorage.app",
    messagingSenderId: "772772570628",
    appId: "1:772772570628:web:1819a838a06265b2687751",
    measurementId: "G-6ZNYQ4ZCWZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName='login'>

        <Stack.Screen
          name="login"
          component={loginScreen}
          options={{
            title: '',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: '#283f4e',
            headerStyle: { backgroundColor: '#d9ebff' }
          }} />

        <Stack.Screen
          name="Convercao"
          component={ConvercaoScreen}
          options={{
            headerShown: false
          }}
        />

          <Stack.Screen
          name="Detalhar"
          component={DetalharScreen}
          options={{
            headerShown: false
          }}
        />

         <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            headerShown: false
          }}
        />

         <Stack.Screen
          name="AlterarSenhaScreen"
          component={AlterarSenhaScreen}
          options={{
            title: '',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: '#283f4e',
            headerStyle: { backgroundColor: '#d9ebff' }
          }} />

        

        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{
            title: '',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: '#283f4e',
            headerStyle: { backgroundColor: '#d9ebff' }
          }}
        />

        

      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;