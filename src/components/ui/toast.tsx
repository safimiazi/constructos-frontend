'use client';

import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast, ToastType, useToastState, registerToastDispatch } from '@/hooks/use-toast';

const CONFIG: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    classes: 'bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]',
  },
  error: {
    icon: <XCircle size={18} />,
    classes: 'bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    classes: 'bg-[var(--warn-bg)] text-[var(--warn-text)] border border-[var(--warn-border)]',
  },
  info: {
    icon: <Info size={18} />,
    classes: 'bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-border)]',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon, classes } = CONFIG[toast.type];
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-md min-w-70 max-w-sm animate-fade-in ${classes}`}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, addToast, removeToast } = useToastState();

  useEffect(() => {
    registerToastDispatch(addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
