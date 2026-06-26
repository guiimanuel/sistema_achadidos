import { registerRootComponent } from "expo";

import app from "../app";

export { default as CadastroScreen } from "./screens/CadastroScreen";
export { default as AlterarSenhaScreen } from "./screens/AlterarSenhaScreen";
export { default as LoginScreen } from "./screens/LoginScreen";
export { default as HomeScreen } from "./screens/HomeScreen";
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(app);
