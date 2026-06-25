import { registerRootComponent } from "expo";

import app from "../app";

export { default as cadastroScreen } from './src/screens/cadastroScreen';
export { default as alterarSenhaScreen } from './src/screens/alterarSenhaScreen';
export { default as loginScreen } from './src/screens/loginScreen';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(app);
