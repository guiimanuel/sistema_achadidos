import { registerRootComponent } from 'expo';

import App from '../services/App';
export { default as CadastroScreen } from './CadastroScreen';
export { default as loginScreen } from './loginScreen';
export { default as ConvercaoScreen } from './ConvercaoScreen';
export { default as DetalharScreen } from './DetalharScreen';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
