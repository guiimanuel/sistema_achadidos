import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useExpoFonts } from './src/hooks/useExpoFonts';
import AppNavigator from './src/navigation/AppNavigator';
import AppAlertHost from './src/components/AppAlertHost';
import { AuthProvider } from './src/providers/AuthProvider';
import { colors } from './src/styles/colors';

export default function App() {
  const { fontsLoaded, fontError } = useExpoFonts();

  if (fontError) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text>Não foi possível carregar as fontes. Reinicie o aplicativo.</Text></View>;

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.green_primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.green_primary }}>
      <KeyboardProvider statusBarTranslucent preserveEdgeToEdge>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
          <AppNavigator />
          <AppAlertHost />
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
