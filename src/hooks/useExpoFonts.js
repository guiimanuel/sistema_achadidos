import { useFonts, isLoaded } from 'expo-font';
import { useEffect } from 'react';

const fontes = {
  MontserratRegular: require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
  MontserratMedium: require('../assets/fonts/Montserrat/static/Montserrat-Medium.ttf'),
  MontserratSemiBold: require('../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf'),
  MontserratBold: require('../assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  MontserratExtraBold: require('../assets/fonts/Montserrat/static/Montserrat-ExtraBold.ttf'),
};

export function useExpoFonts() {
  const [fontsLoaded, fontError] = useFonts(fontes);
  useEffect(() => {
    if (fontsLoaded && __DEV__) {
      console.info('Fontes Montserrat carregadas:', Object.keys(fontes).filter(isLoaded).join(', '));
    }
  }, [fontsLoaded]);
  return { fontsLoaded, fontError };
}
export default useExpoFonts;
