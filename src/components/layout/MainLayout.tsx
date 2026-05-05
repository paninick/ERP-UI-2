import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import ToastContainer from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { setDocumentTitle } from '@/utils/documentTitle';

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const uiTheme = useAppStore((s) => s.uiTheme);
  const setAutoCollapse = useAppStore((s) => s.setAutoCollapse);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getInfo = useAuthStore((state) => state.getInfo);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setAutoCollapse(e.matches);
    };
    handleChange(mql);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [setAutoCollapse]);

  useEffect(() => {
    if (!token || user) return;
    getInfo().catch(() => {});
  }, [token, user, getInfo]);

  useEffect(() => {
    setDocumentTitle(location.pathname);
  }, [location.pathname]);

  return (
    <div
      data-ui-theme={uiTheme}
      className={`min-h-screen text-slate-800 ${
        uiTheme === 'google'
          ? 'bg-[#f8fafd]'
          : uiTheme === 'night'
            ? 'jtech-grid bg-[#07111f] text-slate-100'
          : 'jtech-grid bg-[#f0ede6]'
      }`}
    >
      <a
        href="#main-content"
        className="absolute -top-12 left-4 z-[9999] rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all focus:top-4"
      >
        {t('common.skipToContent')}
      </a>
      <Sidebar />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <Header />
        <main id="main-content" className="p-4 md:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
