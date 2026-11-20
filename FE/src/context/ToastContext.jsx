import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check } from '../components/Icons';

const ToastContext = createContext(null);
let nextId = 1;

/**
 * toast.show({ message, variant: 'default' | 'error' | 'success', action: { label, onClick }, duration })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ message, variant = 'default', action, duration = 4000 }) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-2), { id, message, variant, action }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className={[
              'pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-xl py-2 pl-4 pr-2 text-sm shadow-lg',
              t.variant === 'error' && 'border border-[#FECDCA] bg-[#FEF3F2] text-[#912018]',
              t.variant === 'success' && 'border border-[#ABEFC6] bg-[#ECFDF3] text-[#05603A]',
              t.variant === 'default' && 'bg-ink text-white',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="flex min-h-10 items-center gap-2">
              {t.variant === 'success' && <Check size={16} />}
              {t.message}
            </span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
                className={[
                  'min-h-10 rounded-lg px-3.5 font-semibold',
                  t.variant === 'default' ? 'bg-[#2A2F3A] text-[#C7CBFF] hover:bg-[#363C49]' : 'bg-white',
                ].join(' ')}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
