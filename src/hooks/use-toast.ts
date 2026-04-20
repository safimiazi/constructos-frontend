'use client';

import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let externalDispatch: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function registerToastDispatch(fn: (toast: Omit<Toast, 'id'>) => void) {
  externalDispatch = fn;
}

function dispatch(type: ToastType, message: string) {
  if (externalDispatch) {
    externalDispatch({ type, message });
  } else {
    console.warn('[toast] ToastContainer not mounted yet');
  }
}

export const toast = {
  success: (message: string) => dispatch('success', message),
  error: (message: string) => dispatch('error', message),
  warning: (message: string) => dispatch('warning', message),
  info: (message: string) => dispatch('info', message),
};

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
