import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="absolute -top-12 left-4 z-[9999] rounded-lg bg-indigo-600 px-4 py-3 text-sm text-white shadow-lg transition-all focus:top-4"
      >
        {t('common.skipToContent')}
      </a>
      <Sidebar />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <Header />
        <main id="main-content" className="p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
