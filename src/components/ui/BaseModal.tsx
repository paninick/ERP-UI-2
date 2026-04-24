import {ReactNode, useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {X} from 'lucide-react';

interface BaseModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onOk?: () => void;
  children: ReactNode;
  width?: string;
  loading?: boolean;
}

export default function BaseModal({
  open,
  title,
  onClose,
  onOk,
  children,
  width = '500px',
  loading,
}: BaseModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{opacity: 0, scale: 0.95, y: 20}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95, y: 20}}
            className="relative overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{width, maxHeight: '85vh'}}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100" aria-label="关闭">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4" style={{maxHeight: 'calc(85vh - 120px)'}}>
              {children}
            </div>
            {onOk && (
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={onOk}
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? '提交中...' : '确定'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
