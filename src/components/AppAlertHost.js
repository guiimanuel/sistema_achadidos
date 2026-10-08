import React, { useSyncExternalStore } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors.js';
import { useExpoFonts } from './expoFonts.js';
import { dismissAlert, getCurrentAlert, pressAlertButton, subscribeAlerts } from '../services/alerts.js';

export default function AppAlertHost() {
  const alert = useSyncExternalStore(subscribeAlerts, getCurrentAlert, getCurrentAlert);
  const { fontsLoaded } = useExpoFonts();

  return (
    <Modal
      transparent
      visible={Boolean(alert)}
      animationType="fade"
      onRequestClose={() => dismissAlert(alert)}
    >
      <SafeAreaView style={styles.alertContainer}>
        {alert && (
          <View style={styles.alertBox} accessibilityViewIsModal>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              <Text accessibilityRole="header" style={[styles.alertTitle, !fontsLoaded && styles.fallbackBold]}>{alert.title}</Text>
              {alert.message ? <Text style={[styles.alertMessage, !fontsLoaded && styles.fallbackText]}>{alert.message}</Text> : null}
              <View style={styles.buttons}>
                {alert.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.alertButton}
                    accessibilityRole="button"
                    onPress={() => pressAlertButton(alert, button)}
                  >
                    <Text style={[styles.alertButtonText, !fontsLoaded && styles.fallbackBold]}>{button.text || 'OK'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  alertBox: {
    width: '80%',
    maxHeight: '85%',
    backgroundColor: '#d20000',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  alertTitle: {
    fontSize: 20,
    color: colors.white,
    fontFamily: 'MontserratBold',
    marginBottom: 12,
    textAlign: 'center',
  },

  alertMessage: {
    fontSize: 15,
    color: colors.white,
    fontFamily: 'MontserratMedium',
    textAlign: 'center',
    marginBottom: 20,
  },

  alertButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },

  alertButtonText: {
    color: '#da0000',
    fontFamily: 'MontserratBold',
    fontSize: 15,
  },

  content: { width: '100%', flexGrow: 0 },
  contentContainer: { alignItems: 'center' },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  fallbackBold: { fontFamily: undefined, fontWeight: 'bold' },
  fallbackText: { fontFamily: undefined },
});
