let queue = [];
const listeners = new Set();

function notify() {
  listeners.forEach(listener => listener());
}

export function subscribeAlerts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentAlert() {
  return queue[0] || null;
}

export const AppAlert = {
  alert(title, message, buttons, options = {}) {
    queue = [...queue, {
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: 'OK' }],
      options,
    }];
    notify();
  },
};

export function pressAlertButton(alert, button) {
  if (!alert || getCurrentAlert() !== alert) return;
  queue = queue.slice(1);
  notify();
  button.onPress?.();
}

export function dismissAlert(alert) {
  if (!alert || getCurrentAlert() !== alert) return;
  const cancelButton = alert.buttons.find(button => button.style === 'cancel');
  if (cancelButton) {
    pressAlertButton(alert, cancelButton);
  } else if (alert.buttons.length === 1 && alert.buttons[0].style !== 'destructive') {
    pressAlertButton(alert, alert.buttons[0]);
  } else if (alert.options.cancelable) {
    queue = queue.slice(1);
    notify();
    alert.options.onDismiss?.();
  }
}
