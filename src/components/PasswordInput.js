import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors.js';

export default function PasswordInput({ style, editable = true, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        style={[style, styles.input]}
        editable={editable}
        secureTextEntry={!visible}
      />
      <TouchableOpacity
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        accessibilityState={{ disabled: !editable }}
        disabled={!editable}
        onPress={() => setVisible(value => !value)}
      >
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.text_primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { paddingRight: 56 },
  toggle: { position: 'absolute', right: 6, top: 4, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
