import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { theme } from '../styles/theme';

const AppHeader = ({ navigation, showBackButton = false, backRoute = 'Home', title = 'ACHADOS E PERDIDOS' }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.green_primary,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 80 + insets.top,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
      }}
    >
      {showBackButton && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 16,
            top: insets.top + 16,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          onPress={() => navigation.navigate(backRoute)}
          accessibilityRole="button"
          accessibilityLabel={backRoute === 'Login' ? 'Voltar para login' : 'Voltar para o mural'}
        >
          <Ionicons name="arrow-back" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      <Text style={[theme.typography.headerTitle, { width: '100%', textAlign: 'center', paddingHorizontal: showBackButton ? 72 : 16 }]}>
        {title}
      </Text>
    </View>
  );
};


export default AppHeader;
