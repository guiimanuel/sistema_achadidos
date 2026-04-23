import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import loginScreen from './src/screens/loginScreen';
import initialScreen from './src/screens/initialScreen';
import registerScreen from './src/screens/registerScreen';

const Stack = createNativeStackNavigator();


function App() {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDJNdnO73hmGPMga5JibbPoJqdQPuhZjxk",
    authDomain: "logincadfirebase.firebaseapp.com",
    projectId: "logincadfirebase",
    storageBucket: "logincadfirebase.firebasestorage.app",
    messagingSenderId: "45085913810",
    appId: "1:45085913810:web:f20766ef06aaaffcea730b",
    measurementId: "G-2Y2VC65EWB"
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
            title: 'Tela de Login',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: '#ffffff',
            headerStyle: { backgroundColor: '#263466' }
          }} />

        <Stack.Screen
          name="initial"
          component={initialScreen}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="register"
          component={registerScreen}
          options={{
            title: 'Tela de Cadastro',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: '#ffffff',
            headerStyle: { backgroundColor: '#263466' }
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;