import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import loginScreen from '../screens/loginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import AlterarSenhaScreen from '../screens/AlterarSenhaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import DetalharScreen from '../screens/DetalharScreen';
import CadastrarItemScreen from '../screens/CadastrarItemScreen';
import MinhasPublicacoesScreen from '../screens/MinhasPublicacoesScreen';
import EscolherImagem from '../screens/EscolherImagemScreen';
import EditarItem from '../screens/EditarItemScreen';
import EscolherImagemEditar from '../screens/EscolherImagemEditarScreen';



const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">

        <Stack.Screen
          name="login"
          component={loginScreen}
          options={{
            title: 'ACHADOS E PERDIDOS',
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#059600' }
          }}
        />

        <Stack.Screen name="Detalhar" component={DetalharScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Perfil" component={PerfilScreen} />

        <Stack.Screen name="AlterarSenhaScreen" component={AlterarSenhaScreen} />

        <Stack.Screen name="Cadastro" component={CadastroScreen} />

        <Stack.Screen name="MinhasPublicacoes" component={MinhasPublicacoesScreen} />

        <Stack.Screen name="CadastrarItem" component={CadastrarItemScreen} />

        <Stack.Screen name="EscolherImagem" component={EscolherImagem} />
         <Stack.Screen name="EditarItem" component={EditarItem} />
         <Stack.Screen name="EscolherImagemEditar" component={EscolherImagemEditar} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;