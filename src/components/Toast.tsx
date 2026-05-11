import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

type ToastTone = 'success' | 'error';

type ToastState = {
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | undefined>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ message, tone });
    timeoutRef.current = setTimeout(() => setToast(undefined), 2400);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={[styles.toast, toast.tone === 'error' && styles.errorToast]}>
          <Text style={[styles.toastText, toast.tone === 'error' && styles.errorToastText]}>{toast.message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    bottom: 96,
    left: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.lg,
    ...shadow.floating,
  },
  errorToast: {
    backgroundColor: colors.loss,
  },
  toastText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorToastText: {
    color: colors.surface,
  },
});
