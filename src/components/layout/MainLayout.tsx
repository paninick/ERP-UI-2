import {Outlet} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import {useAppStore} from '@/stores/appStore';
import ToastContainer from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function MainLayout() {
  const { t } = useTranslation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

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
        <main id="main-content" className="p-6">
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
