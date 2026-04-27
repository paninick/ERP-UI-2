import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmStore {
  open: boolean;
  message: string;
  title: string;
  resolve: ((value: boolean) => void) | null;
  _show: (message: string, title: string) => Promise<boolean>;
  _answer: (value: boolean) => void;
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  open: false,
  message: '',
  title: '',
  resolve: null,

  _show: (message, title) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, message, title, resolve });
    }),

  _answer: (value) => {
    const { resolve } = get();
    set({ open: false, resolve: null });
    resolve?.(value);
  },
}));

export function confirm(message: string, title = ''): Promise<boolean> {
  return useConfirmStore.getState()._show(message, title);
}

export default function ConfirmDialog() {
  const { t } = useTranslation();
  const { open, message, title, _answer } = useConfirmStore();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => cancelRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const cancel = cancelRef.current;
      const confirm = confirmRef.current;
      if (!cancel || !confirm) return;

      const focusable = [cancel, confirm];
      const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
      if (e.shiftKey) {
        if (currentIndex <= 0) { e.preventDefault(); confirm.focus(); }
      } else {
        if (currentIndex >= focusable.length - 1) { e.preventDefault(); cancel.focus(); }
      }
    }
    if (e.key === 'Escape') {
      _answer(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => _answer(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
              <AlertTriangle size={20} className="shrink-0 text-amber-500" />
              <h3 id="confirm-title" className="text-lg font-semibold text-slate-800">
                {title || t('common.confirmOperation')}
              </h3>
            </div>
            <div className="px-6 py-5">
              <p id="confirm-message" className="text-sm text-slate-600">
                {message}
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => _answer(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
              >
                {t('common.cancel')}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => _answer(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                {t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
