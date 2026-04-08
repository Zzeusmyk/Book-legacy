import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ message, type });
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    timeout.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setToast(null);
      });
    }, 3000);
  }, [opacity]);

  const bgColor = toast?.type === 'error' ? colors.error
    : toast?.type === 'warning' ? colors.warning
    : toast?.type === 'info' ? colors.info
    : colors.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View style={[styles.toast, { opacity, backgroundColor: bgColor }]}>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
