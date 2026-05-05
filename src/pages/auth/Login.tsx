import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, MoonStar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { setDocumentTitle } from '@/utils/documentTitle';
import DragonTransition from '@/components/layout/DragonTransition';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragonActive, setDragonActive] = useState(false);
  const login = useAuthStore((state) => state.login);
  const getInfo = useAuthStore((state) => state.getInfo);
  const uiTheme = useAppStore((state) => state.uiTheme);
  const setUiTheme = useAppStore((state) => state.setUiTheme);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setDocumentTitle('/login');
  }, []);

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
      setDragonActive(true);
      // 龙转场播完后跳转（由 handleDragonComplete 触发）
    } catch (err: any) {
      setError(err.message || t('loginFailed'));
      setLoading(false);
    }
  };

  const handleDragonComplete = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden p-4 ${
      uiTheme === 'google' ? 'bg-[#f7faff]' : uiTheme === 'night' ? 'bg-[#06101d]' : 'bg-[#f0ede6]'
    }`}>
      <div className={`absolute inset-0 ${
        uiTheme === 'google'
          ? 'bg-[radial-gradient(circle_at_top,_rgba(66,133,244,0.08),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]'
          : uiTheme === 'night'
            ? 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.10),_transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1729_42%,#10223b_100%)]'
            : 'jtech-grid opacity-50'
      }`} />
      <div className={`animate-drift-orb absolute -left-16 top-12 h-72 w-72 rounded-full blur-3xl ${
        uiTheme === 'google' ? 'bg-blue-200/30' : uiTheme === 'night' ? 'bg-amber-400/10' : 'bg-amber-300/18'
      }`} />
      <div className={`animate-drift-orb absolute right-0 top-24 h-96 w-96 rounded-full blur-3xl [animation-delay:1.5s] ${
        uiTheme === 'google' ? 'bg-emerald-100/35' : uiTheme === 'night' ? 'bg-amber-500/8' : 'bg-yellow-200/20'
      }`} />
      <div className={`animate-drift-orb absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl [animation-delay:3s] ${
        uiTheme === 'google' ? 'bg-amber-100/30' : uiTheme === 'night' ? 'bg-orange-400/8' : 'bg-orange-100/16'
      }`} />
      <div className={`pointer-events-none absolute inset-0 ${
        uiTheme === 'night'
          ? 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]'
          : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_42%)]'
      }`} />

      {/* Chinese ink-wash ambient elements — jtech theme */}
      {uiTheme === 'jtech' && (
        <>
          <div className="animate-ink-drop pointer-events-none absolute left-[12%] top-[22%] h-72 w-72 rounded-full bg-slate-800/7 [animation-delay:0.1s]" />
          <div className="animate-ink-drop pointer-events-none absolute right-[8%] top-[38%] h-56 w-56 rounded-full bg-slate-700/5 [animation-delay:0.55s]" />
          <div className="animate-ink-drop pointer-events-none absolute left-[38%] bottom-[12%] h-64 w-64 rounded-full bg-slate-800/5 [animation-delay:0.9s]" />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              className="ink-stroke-path"
              d="M 60 160 Q 260 70 500 190 T 960 150 T 1400 170"
              stroke="rgba(26,32,53,0.055)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              className="ink-stroke-path"
              d="M 100 480 Q 340 380 600 510 T 1120 470"
              stroke="rgba(26,32,53,0.038)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              style={{ animationDelay: '0.45s' }}
            />
            <path
              className="ink-stroke-path"
              d="M 180 720 Q 480 640 760 740 T 1320 700"
              stroke="rgba(26,32,53,0.028)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
              style={{ animationDelay: '0.9s' }}
            />
          </svg>
        </>
      )}

      {/* Night theme ink elements */}
      {uiTheme === 'night' && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            className="ink-stroke-path"
            d="M 60 160 Q 260 70 500 190 T 960 150 T 1400 170"
            stroke="rgba(245,158,11,0.06)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="ink-stroke-path"
            d="M 100 480 Q 340 380 600 510 T 1120 470"
            stroke="rgba(245,158,11,0.04)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{ animationDelay: '0.5s' }}
          />
        </svg>
      )}

      <motion.div
        layout
        className={`absolute right-4 top-4 flex items-center gap-1 rounded-2xl p-1 backdrop-blur-xl shadow-sm ${
          uiTheme === 'night'
            ? 'border border-white/10 bg-slate-950/45'
            : uiTheme === 'google'
              ? 'border border-slate-200 bg-white/90'
              : 'border border-amber-200/22 bg-white/82'
        }`}
      >
        <button
          type="button"
          onClick={() => setUiTheme('google')}
          className={`rounded-lg px-3 py-1 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
            uiTheme === 'google' ? 'bg-blue-500 text-white' : 'text-slate-500'
          }`}
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => setUiTheme('jtech')}
          className={`rounded-lg px-3 py-1 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
            uiTheme === 'jtech' ? 'bg-amber-500 text-white' : 'text-slate-500'
          }`}
        >
          J-Tech
        </button>
        <button
          type="button"
          onClick={() => setUiTheme('night')}
          className={`rounded-lg px-3 py-1 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
            uiTheme === 'night' ? 'bg-slate-900 text-amber-300' : 'text-slate-500'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <MoonStar size={14} />
            Night
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('zh')}
          className={`rounded-lg px-3 py-1 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
            i18n.language === 'zh'
              ? uiTheme === 'google' ? 'bg-blue-500 text-white' : uiTheme === 'night' ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500 text-white'
              : 'text-slate-500'
          }`}
        >
          {t('langZh')}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('ja')}
          className={`rounded-lg px-3 py-1 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
            i18n.language === 'ja'
              ? uiTheme === 'google' ? 'bg-blue-500 text-white' : uiTheme === 'night' ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500 text-white'
              : 'text-slate-500'
          }`}
        >
          {t('langJa')}
        </button>
      </motion.div>

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="hidden lg:block"
        >
          <div className="max-w-2xl">
            <p className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              uiTheme === 'google'
                ? 'border border-blue-200 bg-white text-blue-600'
                : uiTheme === 'night'
                  ? 'border border-amber-400/15 bg-white/5 text-amber-300'
                : 'jtech-pill'
            }`}>
              {uiTheme === 'google' ? 'Google Workspace Style' : uiTheme === 'night' ? 'Night Motion Console' : 'Tokyo Knit Control Grid'}
            </p>
            <h1 className={`mt-6 text-5xl font-semibold leading-tight ${
              uiTheme === 'google' ? 'text-slate-900' : uiTheme === 'night' ? 'text-white' : 'text-slate-800'
            }`}>
              针织工贸一体系统
              <span className={`mt-3 block ${uiTheme === 'google' ? 'text-blue-600' : uiTheme === 'night' ? 'text-amber-400' : 'text-amber-600'}`}>轻量、克制、可追溯</span>
            </h1>
            <p className={`mt-6 max-w-xl text-base leading-8 ${
              uiTheme === 'google' ? 'text-slate-600' : uiTheme === 'night' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              用更轻的视觉层级承载复杂流程。把销售、技术、生产、质检、仓储和财务放进同一张冷静清晰的控制面板，而不是一堆厚重模块。
            </p>
            <div className="mt-10 grid max-w-2xl gap-4 md:grid-cols-3">
              {[
                { title: '全链穿透', value: 'Sales → Tech → Plan → Job → QC → Stock' },
                { title: '实时判断', value: '冲突预检 / 在制台账 / 风险阻断' },
                { title: '日系科技感', value: '轻面板 / 冷光线 / 慢动画节奏' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.42 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`rounded-[1.5rem] px-4 py-4 ${
                  uiTheme === 'google'
                    ? 'border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                    : uiTheme === 'night'
                      ? 'border border-white/8 bg-white/5 backdrop-blur-xl'
                    : 'jtech-panel jtech-hairline'
                }`}>
                  <p className={`text-[11px] uppercase tracking-[0.22em] ${
                    uiTheme === 'google' ? 'text-slate-500' : uiTheme === 'night' ? 'text-amber-300/60' : 'text-amber-700/55'
                  }`}>{item.title}</p>
                  <p className={`mt-3 text-sm leading-6 ${uiTheme === 'night' ? 'text-slate-200' : 'text-slate-700'}`}>{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.div
          key={uiTheme}
          initial={{ opacity: 0, x: 24, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-md justify-self-center"
        >
          <motion.div
            layout
            className={`relative overflow-hidden rounded-[2rem] p-8 ${
            uiTheme === 'google'
              ? 'border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)]'
              : uiTheme === 'night'
                ? 'border border-white/8 bg-slate-950/52 backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,8,18,0.38)]'
              : 'jtech-panel jtech-hairline'
          }`}>
            <div className={`absolute inset-x-0 top-0 h-px ${
              uiTheme === 'google'
                ? 'animate-shine-line bg-gradient-to-r from-transparent via-blue-400/80 to-transparent'
                : uiTheme === 'night'
                  ? 'animate-shine-line bg-gradient-to-r from-transparent via-amber-400/80 to-transparent'
                : 'animate-shine-line bg-gradient-to-r from-transparent via-amber-400/70 to-transparent'
            }`} />
            <div className="mb-8 text-center">
              <div className={`animate-gentle-bob mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border shadow-[0_0_35px_rgba(245,158,11,0.14)] ${
                uiTheme === 'night'
                  ? 'border-amber-400/15 bg-amber-400/10 text-amber-300'
                  : uiTheme === 'google'
                    ? 'border-blue-200/40 bg-blue-50 text-blue-600'
                    : 'border-amber-300/30 bg-amber-100/70 text-amber-700'
              }`}>
                <Lock size={24} />
              </div>
              <h1 className={`text-3xl font-semibold tracking-[0.06em] ${uiTheme === 'night' ? 'text-white' : 'text-slate-900'}`}>{t('appName')}</h1>
              <p className={`mt-2 text-sm ${uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>{t('appSubtitle')}</p>
              <p className={`mt-1 text-[11px] uppercase tracking-[0.28em] ${uiTheme === 'night' ? 'text-amber-400/55' : 'text-amber-700/55'}`}>J-Tech Access Node</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${uiTheme === 'night' ? 'text-amber-400/40' : 'text-amber-400/50'}`} />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder={t('username')}
                  aria-label={t('username')}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={`w-full rounded-2xl py-3.5 pl-10 pr-4 outline-none transition ${
                    uiTheme === 'night'
                      ? 'border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-white/8'
                      : uiTheme === 'google'
                        ? 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white'
                        : 'border border-amber-200/22 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:border-amber-400/55 focus:bg-white'
                  }`}
                />
              </div>
              <div className="relative">
                <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${uiTheme === 'night' ? 'text-amber-400/40' : 'text-amber-400/50'}`} />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('password')}
                  aria-label={t('password')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`w-full rounded-2xl py-3.5 pl-10 pr-4 outline-none transition ${
                    uiTheme === 'night'
                      ? 'border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-white/8'
                      : uiTheme === 'google'
                        ? 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white'
                        : 'border border-amber-200/22 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:border-amber-400/55 focus:bg-white'
                  }`}
                />
              </div>

              {error && <p className={`text-center text-sm ${uiTheme === 'night' ? 'text-rose-300' : 'text-rose-500'}`}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-1 active:scale-[0.985] disabled:opacity-50 ${
                  uiTheme === 'google'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : uiTheme === 'night'
                      ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_12px_28px_rgba(245,158,11,0.22)]'
                      : 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_12px_28px_rgba(245,158,11,0.22)]'
                }`}
              >
                {loading ? t('loggingIn') : t('login')}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <span className={uiTheme === 'night' ? 'text-slate-500' : ''}>ERP-OS / Knit Flow</span>
              <span className={uiTheme === 'night' ? 'text-slate-500' : ''}>Secure Session</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 龙转场覆盖层 */}
      <DragonTransition isActive={dragonActive} onComplete={handleDragonComplete} />
    </div>
  );
}
