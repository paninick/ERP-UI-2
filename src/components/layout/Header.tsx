import { useAuthStore } from '@/stores/authStore';
import { Bell, LogOut, Search, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = async (language: 'zh' | 'ja') => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-slate-500">
        <Search size={16} />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="w-48 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => handleLanguageChange('zh')}
            className={`rounded px-2 py-1 text-xs ${
              i18n.language === 'zh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t('langZh')}
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('ja')}
            className={`rounded px-2 py-1 text-xs ${
              i18n.language === 'ja' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t('langJa')}
          </button>
        </div>
        <button aria-label={t('nav.notifications')} className="relative rounded-lg p-2 hover:bg-slate-100">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            <User size={16} className="text-indigo-600" />
          </div>
          <span className="text-sm text-slate-700">{user?.nickname || user?.username || t('userFallback')}</span>
        </div>
        <button
          onClick={handleLogout}
          aria-label={t('logout')}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <LogOut size={18} className="text-slate-600" />
        </button>
      </div>
    </header>
  );
}
