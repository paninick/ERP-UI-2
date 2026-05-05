import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface BaseModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onOk?: () => void;
  children: ReactNode;
  width?: string;
  loading?: boolean;
  testId?: string;
}

export default function BaseModal({
  open,
  title,
  onClose,
  onOk,
  children,
  width = '500px',
  loading,
  testId,
}: BaseModalProps) {
  const { t } = useTranslation();
  const uiTheme = useAppStore((state) => state.uiTheme);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`relative overflow-hidden rounded-2xl shadow-2xl ${
              uiTheme === 'night'
                ? 'border border-white/10 bg-slate-900 text-slate-100'
                : uiTheme === 'google'
                  ? 'border border-slate-200 bg-white'
                : 'border border-amber-200/22 bg-white'
            }`}
            data-testid={testId}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{ width, maxHeight: '85vh' }}
          >
            {/* Amber shine line at top */}
            <div className={`absolute inset-x-0 top-0 h-px ${
              uiTheme === 'google'
                ? 'bg-gradient-to-r from-transparent via-blue-400/60 to-transparent'
                : 'bg-gradient-to-r from-transparent via-amber-400/60 to-transparent'
            }`} />
            <div className={`flex items-center justify-between px-6 py-4 ${
              uiTheme === 'night'
                ? 'border-b border-white/8'
                : uiTheme === 'google'
                  ? 'border-b border-slate-200'
                : 'border-b border-amber-200/18'
            }`}>
              <h3 className={`text-lg font-semibold ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label={t('common.close')}
                className={`rounded-xl p-1.5 transition ${
                  uiTheme === 'night' ? 'hover:bg-white/8 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {children}
            </div>
            {onOk && (
              <div className={`flex justify-end gap-3 px-6 py-4 ${
                uiTheme === 'night'
                  ? 'border-t border-white/8 bg-white/4'
                  : uiTheme === 'google'
                    ? 'border-t border-slate-200 bg-slate-50'
                  : 'border-t border-amber-200/18 bg-amber-50/40'
              }`}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    uiTheme === 'night' ? 'text-slate-300 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onOk}
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                    uiTheme === 'google'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-amber-500 hover:bg-amber-400 shadow-[0_6px_20px_rgba(245,158,11,0.22)]'
                  }`}
                >
                  {loading ? t('common.submitting') : t('common.confirm')}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
