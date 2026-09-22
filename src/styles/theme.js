// src/styles/theme.js
import { colors } from './colors';

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
      color: colors.white,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    screenTitle: {
      fontFamily: 'MontserratExtraBold',
      fontSize: 22,
      color: colors.text_title,
      letterSpacing: 0.3,
      includeFontPadding: false,
    },
    itemTitle: {
      fontFamily: 'MontserratSemiBold',
      fontSize: 16,
      color: colors.text_primary,
      includeFontPadding: false,
    },
    body: {
      fontFamily: 'MontserratRegular',
      fontSize: 14,
      color: colors.text_secondary,
      lineHeight: 20,
      includeFontPadding: false,
    },
    buttonText: {
      fontFamily: 'MontserratBold',
      fontSize: 15,
      color: colors.white,
      letterSpacing: 0.5,
      includeFontPadding: false,
    },
    caption: {
      fontFamily: 'MontserratSemiBold',
      fontSize: 12,
      color: colors.gray_muted,
      includeFontPadding: false,
    },
  },
};
