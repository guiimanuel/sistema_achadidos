import { useFonts } from 'expo-font';

export function useExpoFonts() {
    const [fontsLoaded] = useFonts({
        'BebasNeueRegular': require('../assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf'),
        'PoppinsRegular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'PoppinsMedium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'PoppinsSemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'PoppinsBold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    });
    return fontsLoaded;
}
export default useExpoFonts;