import * as React from "react";
import { Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import loginScreen from "./src/screens/loginScreen";
import cadastroScreen from "./src/screens/cadastroScreen";
import alterarSenhaScreen from "./src/screens/alterarSenhaScreen";
import { colors } from "./src/components/colors";
import "./src/utils/firebase";

const Stack = createNativeStackNavigator();

function app() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen
          name="login"
          component={loginScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="alterarSenha"
          component={alterarSenhaScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="cadastro"
          component={cadastroScreen}
          options={{
            title: "ACHADOS E PERDIDOS",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.green_primary },
          }}
        />
        <Stack.Screen
          name="home"
          component={homeScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default app;
