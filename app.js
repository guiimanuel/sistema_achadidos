import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import AlterarSenhaScreen from "./src/screens/AlterarSenhaScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { colors } from "./src/components/colors";
import "./src/utils/firebase";

const Stack = createNativeStackNavigator();

function app() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="AlterarSenha"
          component={AlterarSenhaScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default app;
