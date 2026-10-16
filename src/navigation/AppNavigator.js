import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import { colors } from '../styles/colors';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import AlterarSenhaScreen from '../screens/AlterarSenhaScreen';
import HomeScreen from '../screens/HomeScreen';
import CadastrarItemScreen from '../screens/CadastrarItemScreen';
import EditarItemScreen from '../screens/EditarItemScreen';
import ItemFullScreen from '../screens/ItemFullScreen';
import EscolherImagemScreen from '../screens/EscolherImagemScreen';
import EscolherImagemEditarScreen from '../screens/EscolherImagemEditarScreen';
import CameraItemScreen from '../screens/CameraItemScreen';
import MinhasPublicacoesScreen from '../screens/MinhasPublicacoesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { observarToquesNotificacao, limparToqueNotificacao } from '../services/notifications';
import { buscarPublicacao } from '../services/publicacoes';
import { useAuth } from '../hooks/useAuth';
import { AppAlert } from '../services/alerts';
import { podePublicar } from '../utils/permissoes';
import { View, Text } from 'react-native';


const Stack = createNativeStackNavigator();

function protegerPublicacao(Component) {
  return function TelaProtegida(props) {
    const { usuario } = useAuth();
    if (!podePublicar(usuario)) return <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}><Text>Publicações disponíveis apenas para contas verificadas que não sejam de discentes.</Text></View>;
    return <Component {...props} />;
  };
}
const CadastrarProtegido = protegerPublicacao(CadastrarItemScreen);
const EditarProtegido = protegerPublicacao(EditarItemScreen);
const MinhasProtegido = protegerPublicacao(MinhasPublicacoesScreen);
const ImagemProtegida = protegerPublicacao(EscolherImagemScreen);
const ImagemEditarProtegida = protegerPublicacao(EscolherImagemEditarScreen);
const CameraProtegida = protegerPublicacao(CameraItemScreen);

export default function AppNavigator() {
  const navigationRef = useRef(null);
  const handled = useRef(new Set());
  const [ready, setReady] = useState(false);
  const [response, setResponse] = useState(null);
  const { carregando } = useAuth();
  useEffect(() => observarToquesNotificacao(setResponse), []);
  useEffect(() => {
    if (!ready || carregando || !response) return;
    const identifier = response.notification.request.identifier;
    const itemId = response.notification.request.content.data?.itemId;
    if (handled.current.has(identifier) || typeof itemId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(itemId)) return;
    handled.current.add(identifier);
    void limparToqueNotificacao().catch(() => {});
    let cancelled = false;
    buscarPublicacao(itemId, response.notification.request.content.data?.collection || 'itens').then((item) => {
      if (cancelled) return;
      if (item) navigationRef.current?.navigate('ItemFullScreen', { item });
      else AppAlert.alert('Item indisponível', 'Esta publicação não está mais disponível.');
    }).catch(() => {
      if (!cancelled) AppAlert.alert('Aviso', 'Não foi possível abrir o item. Verifique sua conexão e tente pelo mural.', undefined, { variant: 'error' });
    });
    return () => { cancelled = true; };
  }, [ready, carregando, response]);
  return (
    <NavigationContainer ref={navigationRef} onReady={() => setReady(true)}>
      <Stack.Navigator initialRouteName="Home">
        {/* LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            header: () => (
              <AppHeader navigation={navigation} showBackButton={true} />
            ),
          })}
        />

        {/* ALTERAR SENHA */}
        <Stack.Screen
          name="AlterarSenha"
          component={AlterarSenhaScreen}
          options={({ navigation }) => ({
            header: () => <AppHeader navigation={navigation} showBackButton={true} backRoute="Login" />,
          })}
        />

        {/* CADASTRO */}
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={({ navigation }) => ({
            header: () => <AppHeader navigation={navigation} showBackButton={true} backRoute="Login" />,
          })}
        />

        {/* HOME */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            statusBarTranslucent: true,
            statusBarStyle: 'light',
            contentStyle: { backgroundColor: colors.green_primary },
          }}
        />

        {/* CADASTRAR ITEM */}
        <Stack.Screen
          name="CadastrarItem"
          component={CadastrarProtegido}
          options={{
            headerShown: false,
          }}
        />

        {/* EDITAR ITEM */}
        <Stack.Screen
          name="EditarItem"
          component={EditarProtegido}
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
          component={ImagemProtegida}
          options={({ navigation }) => ({
            header: () => <AppHeader navigation={navigation} />,
          })}
        />

        {/* ESCOLHER IMAGEM EDITAR */}
        <Stack.Screen
          name="EscolherImagemEditar"
          component={ImagemEditarProtegida}
          options={({ navigation }) => ({
            header: () => <AppHeader navigation={navigation} />,
          })}
        />

        <Stack.Screen name="CameraItem" component={CameraProtegida} options={{ headerShown: false }} />

        {/* MINHAS PUBLICAÇÕES */}
        <Stack.Screen
          name="MinhasPublicacoes"
          component={MinhasProtegido}
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
  );
}
