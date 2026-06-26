import { registerRootComponent } from 'expo';

import App from '../services/App';
export { default as CadastroScreen } from './CadastroScreen';
export { default as loginScreen } from './loginScreen';
export { default as DetalharScreen } from './DetalharScreen';
export { default as CadastrarItemScreen } from './CadastrarItemScreen';
export { default as MinhasPublicacoesScreen } from './MinhasPublicacoesScreen';
// ADICIONE ESSA LINHA ABAIXO:
export { default as EditarItemScreen } from './EditarItemScreen'; 


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);