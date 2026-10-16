import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors.js';

export default function UserAvatar({ user, size = 52, style }) {
  const name = user?.displayName?.trim() || user?.email?.trim() || '';
  const initial = Array.from(name)[0]?.toLocaleUpperCase('pt-BR') || '?';

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#d8ded4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  initial: {
    color: colors.green_primary,
    fontFamily: 'MontserratExtraBold',
    includeFontPadding: false,
  },
});
