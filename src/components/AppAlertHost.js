import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, AppState, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, FadeOut, ReduceMotion, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors.js';
import { useExpoFonts } from '../hooks/useExpoFonts.js';
import { dismissAlert, dismissToast, getCurrentAlert, pressAlertButton, subscribeAlerts } from '../services/alerts.js';

const toastExit = (values) => {
  'worklet';
  // Move the entire card and its shadow beyond the top edge of the screen.
  const distance = Math.max(0, values.currentGlobalOriginY) + values.currentHeight + 24;
  return {
    initialValues: { transform: [{ translateY: 0 }] },
    animations: {
      transform: [{ translateY: withTiming(-distance, {
        duration: 280,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        reduceMotion: ReduceMotion.System,
      }) }],
    },
  };
};
const reducedToastExit = FadeOut.duration(120).reduceMotion(ReduceMotion.Never);

export default function AppAlertHost() {
  const alert = useSyncExternalStore(subscribeAlerts, getCurrentAlert, getCurrentAlert);
  const { fontsLoaded } = useExpoFonts();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  const [reduceMotion, setReduceMotion] = useState(true);
  const isToast = alert?.presentation === 'toast';
  const isRedAlert = alert?.options.variant === 'error';
  const isSuccessModal = alert?.options.variant === 'success';
  const modalAccent = isSuccessModal ? colors.green_dark : colors.error;
  const destructive = alert?.buttons.some(button => button.style === 'destructive');
  const icon = isRedAlert ? 'alert-circle-outline' : destructive ? 'warning-outline' : alert?.options.variant === 'success' ? 'checkmark' : 'information-circle-outline';

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const state = AppState.addEventListener('change', setAppState);
    return () => { mounted = false; motion.remove(); state.remove(); };
  }, []);

  useEffect(() => {
    if (!isToast || (appState && appState !== 'active')) return;
    let cancelled = false;
    let timer;
    AccessibilityInfo.announceForAccessibility(`${alert.title}. ${alert.message || ''}`);
    // Android can extend this duration according to the user's accessibility settings.
    const recommended = AccessibilityInfo.getRecommendedTimeoutMillis?.(5000);
    Promise.resolve(recommended ?? 5000).catch(() => 5000).then(duration => {
      if (!cancelled) timer = setTimeout(() => dismissToast(alert), Math.max(5000, duration || 5000));
    });
    return () => { cancelled = true; clearTimeout(timer); };
  }, [alert, isToast, appState]);

  const boldFallback = !fontsLoaded && styles.fallbackBold;
  const textFallback = !fontsLoaded && styles.fallbackText;

  if (isToast) {
    return (
      <Animated.View key={alert.id} exiting={reduceMotion ? reducedToastExit : toastExit} pointerEvents="box-none" style={[styles.toastContainer, { top: insets.top + 12 }]}>
        <View style={styles.toast}>
          <View style={styles.toastIcon}><Ionicons name="checkmark" size={20} color={colors.green_dark} /></View>
          <View style={styles.toastContent}>
            <Text style={[styles.toastTitle, boldFallback]}>{alert.title}</Text>
            {alert.message ? <Text style={[styles.toastMessage, textFallback]}>{alert.message}</Text> : null}
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar aviso" onPress={() => dismissToast(alert)} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.text_subtle} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Modal transparent visible={Boolean(alert)} animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => dismissAlert(alert)}>
      <SafeAreaView style={styles.alertContainer}>
        {alert && (
          <View style={styles.alertBox} accessibilityViewIsModal>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              <View style={[styles.modalIcon, isSuccessModal && styles.successModalIcon]}>
                <Ionicons name={icon} size={28} color={modalAccent} />
              </View>
              <Text accessibilityRole="header" style={[styles.alertTitle, { color: modalAccent }, boldFallback]}>{alert.title}</Text>
              {alert.message ? <Text style={[styles.alertMessage, textFallback]}>{alert.message}</Text> : null}
              <View style={styles.buttons}>
                {alert.buttons.map((button, index) => (
                  <TouchableOpacity key={index} style={[styles.alertButton, { backgroundColor: modalAccent }, button.style === 'cancel' && styles.cancelButton, button.style === 'destructive' && styles.destructiveButton]} accessibilityRole="button" onPress={() => pressAlertButton(alert, button)}>
                    <Text style={[styles.alertButtonText, button.style === 'cancel' && styles.cancelButtonText, boldFallback]}>{button.text || 'OK'}</Text>
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
  alertContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(20, 32, 24, 0.42)' },
  alertBox: { width: '100%', maxWidth: 380, maxHeight: '85%', backgroundColor: colors.white, borderRadius: 22, padding: 24 },
  content: { width: '100%', flexGrow: 0 },
  contentContainer: { alignItems: 'center' },
  modalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff0ed', marginBottom: 16 },
  successModalIcon: { backgroundColor: colors.green_soft },
  alertTitle: { fontSize: 20, lineHeight: 28, color: colors.text_title, fontFamily: 'MontserratBold', textAlign: 'center', marginBottom: 10 },
  alertMessage: { fontSize: 15, lineHeight: 24, color: colors.text_secondary, fontFamily: 'MontserratMedium', textAlign: 'center' },
  buttons: { width: '100%', gap: 10, marginTop: 24 },
  alertButton: { backgroundColor: colors.error, minHeight: 48, paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertButtonText: { color: colors.white, fontFamily: 'MontserratBold', fontSize: 15, textAlign: 'center' },
  cancelButton: { backgroundColor: '#fff0ed' },
  cancelButtonText: { color: colors.text_body },
  destructiveButton: { backgroundColor: colors.error },
  toastContainer: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 1000, elevation: 20 },
  toast: { width: '100%', maxWidth: 440, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingVertical: 12, paddingRight: 4, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: '#dce7d8', shadowColor: colors.shadow_green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 8 },
  toastIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.green_soft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  toastContent: { flex: 1 },
  toastTitle: { fontSize: 14, lineHeight: 21, color: colors.text_title, fontFamily: 'MontserratBold' },
  toastMessage: { fontSize: 13, lineHeight: 20, color: colors.text_secondary, fontFamily: 'MontserratMedium', marginTop: 2 },
  closeButton: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  fallbackBold: { fontFamily: undefined, fontWeight: 'bold' },
  fallbackText: { fontFamily: undefined },
});
