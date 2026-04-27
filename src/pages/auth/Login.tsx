import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const getInfo = useAuthStore((state) => state.getInfo);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLanguageChange = async (language: 'zh' | 'ja') => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      setError(t('loginRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      await getInfo();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur">
        <button
          type="button"
          onClick={() => handleLanguageChange('zh')}
          className={`rounded-lg px-3 py-1 text-sm ${
            i18n.language === 'zh' ? 'bg-white text-slate-900' : 'text-white/80'
          }`}
        >
          {t('langZh')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('ja')}
          className={`rounded-lg px-3 py-1 text-sm ${
            i18n.language === 'ja' ? 'bg-white text-slate-900' : 'text-white/80'
          }`}
        >
          {t('langJa')}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{t('appName')}</h1>
            <p className="mt-2 text-slate-400">{t('appSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoComplete="username"
                placeholder={t('username')}
                aria-label={t('username')}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-400"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                placeholder={t('password')}
                aria-label={t('password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-400"
              />
            </div>

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? t('loggingIn') : t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
