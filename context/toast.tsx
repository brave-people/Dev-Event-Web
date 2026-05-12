import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import ToastStack, { ToastItem } from 'components/common/toast/ToastStack';

interface ToastContextValue {
  pushToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  pushToast: () => undefined,
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message },
    ]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
