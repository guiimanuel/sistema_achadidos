// src/styles/theme.js
import { colors } from '../components/colors';

export const theme = {
  colors,
  fonts: {
    header: 'MontserratBold',
    title: 'MontserratExtraBold',
    subtitle: 'MontserratSemiBold',
    body: 'MontserratRegular',
    bodyBold: 'MontserratBold',
    caption: 'MontserratSemiBold',
  },
  typography: {
    headerTitle: {
      fontFamily: 'MontserratBold',
      fontSize: 18,
      color: '#FFFFFF',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    screenTitle: {
      fontFamily: 'MontserratExtraBold',
      fontSize: 22,
      color: '#1A1A1A',
      letterSpacing: 0.3,
      includeFontPadding: false,
    },
    itemTitle: {
      fontFamily: 'MontserratSemiBold',
      fontSize: 16,
      color: '#222222',
      includeFontPadding: false,
    },
    body: {
      fontFamily: 'MontserratRegular',
      fontSize: 14,
      color: '#444444',
      lineHeight: 20,
      includeFontPadding: false,
    },
    buttonText: {
      fontFamily: 'MontserratBold',
      fontSize: 15,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      includeFontPadding: false,
    },
    caption: {
      fontFamily: 'MontserratSemiBold',
      fontSize: 12,
      color: '#777777',
      includeFontPadding: false,
    },
  },
};
