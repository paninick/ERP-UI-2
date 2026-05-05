import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Bell, LogOut, MoonStar, Search, Sparkles, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useAppStore } from '@/stores/appStore';
import * as orgApi from '@/api/orgUnit';
import { SKIP_FACTORY_CONTEXT_HEADER } from '@/api/client';
import {
  buildCompanyContextOptions,
  buildCompanyContextOptionsFromBackend,
  getCompanyLabel,
  hasPersistedCompanyContext,
  resolveDefaultCompanyContext,
} from '@/utils/companyContext';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const getInfo = useAuthStore((state) => state.getInfo);
  const logout = useAuthStore((state) => state.logout);
  const currentCompany = useAppStore((state) => state.currentCompany);
  const setCurrentCompany = useAppStore((state) => state.setCurrentCompany);
  const uiTheme = useAppStore((state) => state.uiTheme);
  const setUiTheme = useAppStore((state) => state.setUiTheme);
  const factoryDict = useDictOptions('erp_factory');
  const backendCompanyContexts = user?.erpCompanyContexts || [];
  const [factoryOrgUnits, setFactoryOrgUnits] = useState<any[]>([]);
  const [factoryOrgUnitsLoaded, setFactoryOrgUnitsLoaded] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      getInfo().catch(() => {});
    }
  }, [getInfo, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadFactoryOrgUnits() {
      try {
        const res: any = await orgApi.listOrgUnit(
          {
            pageNum: 1,
            pageSize: 50,
            orgType: 'FACTORY',
            status: '0',
          },
          {
            headers: {
              [SKIP_FACTORY_CONTEXT_HEADER]: '1',
            },
          }
        );
        if (!cancelled) {
          setFactoryOrgUnits(res.rows || []);
          setFactoryOrgUnitsLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setFactoryOrgUnits([]);
          setFactoryOrgUnitsLoaded(true);
        }
      }
    }

    loadFactoryOrgUnits();
    return () => {
      cancelled = true;
    };
  }, []);

  const companyOptions = useMemo(() => {
    const backendOptions = buildCompanyContextOptionsFromBackend(backendCompanyContexts, factoryOrgUnits);
    if (backendOptions.length > 0) {
      return backendOptions;
    }
    return buildCompanyContextOptions(factoryDict.options, factoryOrgUnits);
  }, [backendCompanyContexts, factoryDict.options, factoryOrgUnits]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (backendCompanyContexts.length === 0 && !factoryOrgUnitsLoaded) {
      return;
    }

    if (companyOptions.length === 0) {
      return;
    }

    const nextSelection = resolveDefaultCompanyContext(
      currentCompany,
      companyOptions,
      user?.userId === 1 ? null : (user as any)?.deptId,
      hasPersistedCompanyContext({
        userId: user?.userId,
        deptId: user?.deptId,
      })
    );

    if (!nextSelection) {
      return;
    }

    if (
      nextSelection.code !== currentCompany.code ||
      nextSelection.factoryId !== currentCompany.factoryId ||
      nextSelection.orgFactoryId !== currentCompany.orgFactoryId ||
      nextSelection.mode !== currentCompany.mode
    ) {
      setCurrentCompany(nextSelection, {
        userId: user?.userId,
        deptId: user?.deptId,
      });
    }
  }, [
    companyOptions,
    currentCompany.code,
    currentCompany.factoryId,
    currentCompany.orgFactoryId,
    currentCompany.mode,
    setCurrentCompany,
    factoryOrgUnitsLoaded,
    backendCompanyContexts.length,
    user,
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = async (language: 'zh' | 'ja') => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  const handleCompanySwitch = (code: string) => {
    const next = companyOptions.find((item) => item.code === code);
    if (!next || !next.available) {
      return;
    }

    setCurrentCompany({
      code: next.code,
      factoryId: next.factoryId,
      orgFactoryId: next.orgFactoryId ?? null,
      mode: next.mode,
    }, {
      userId: user?.userId,
      deptId: user?.deptId,
    });
  };

  return (
    <header
      className={`flex h-16 items-center justify-between gap-4 px-5 md:px-6 ${
        uiTheme === 'google'
          ? 'sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_1px_3px_rgba(15,23,42,0.08)] backdrop-blur'
          : uiTheme === 'night'
            ? 'sticky top-0 z-50 border-b border-white/8 bg-slate-950/82 text-slate-100 shadow-[0_10px_30px_rgba(2,8,18,0.26)] backdrop-blur-2xl'
          : 'apple-glass'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-slate-400 shadow-sm ${
          uiTheme === 'google'
            ? 'border border-slate-200 bg-slate-50'
            : uiTheme === 'night'
              ? 'border border-white/10 bg-white/5 text-slate-300'
            : 'border border-amber-200/20 bg-white/88'
        }`}>
          <Search size={16} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className={`w-36 bg-transparent text-sm outline-none placeholder:text-slate-400 lg:w-52 ${
              uiTheme === 'night' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-700'
            }`}
          />
        </div>
        <div className={`hidden items-center gap-2 rounded-2xl px-3 py-2 xl:flex ${
          uiTheme === 'google'
            ? 'border border-slate-200 bg-white shadow-sm'
            : uiTheme === 'night'
              ? 'border border-white/10 bg-white/5 backdrop-blur-xl'
            : 'jtech-panel'
        }`}>
          <div className="pr-2">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
              uiTheme === 'google' ? 'text-slate-500' : 'text-slate-400/70'
            }`}>
              {t('companyContext.title')}
            </p>
            <p className={`text-xs ${uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>{t('companyContext.subtitle')}</p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-xl p-1 ${
            uiTheme === 'google' ? 'bg-slate-50' : uiTheme === 'night' ? 'bg-white/5' : 'bg-white/6'
          }`}>
            {companyOptions.map((option) => {
              const active = option.code === currentCompany.code;
              const disabled = !option.available;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleCompanySwitch(option.code)}
                  disabled={disabled}
                  title={disabled ? t('companyContext.unavailable') : getCompanyLabel(option.code, t)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    active
                      ? uiTheme === 'google'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : uiTheme === 'night'
                          ? 'bg-amber-400/20 text-amber-300 shadow-sm'
                          : 'bg-amber-500 text-white shadow-sm'
                      : uiTheme === 'night'
                        ? 'text-slate-300 hover:bg-white/8'
                        : uiTheme === 'google'
                          ? 'text-slate-600 hover:bg-slate-100'
                          : 'text-slate-600 hover:bg-amber-50'
                  } ${disabled ? 'cursor-not-allowed text-slate-300 hover:bg-transparent' : ''}`}
                >
                  {getCompanyLabel(option.code, t)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="xl:hidden">
          <select
            aria-label={t('companyContext.currentLabel')}
            value={currentCompany.code}
            onChange={(event) => handleCompanySwitch(event.target.value)}
            className={`rounded-xl px-3 py-2 text-xs ${
              uiTheme === 'night'
                ? 'border border-white/10 bg-white/5 text-slate-100'
                : uiTheme === 'google'
                  ? 'border border-slate-200 bg-white text-slate-700'
                  : 'border border-amber-200/20 bg-white/88 text-slate-700'
            }`}
          >
            {companyOptions.map((option) => (
              <option
                key={option.code}
                value={option.code}
                disabled={!option.available}
              >
                {getCompanyLabel(option.code, t)}
              </option>
            ))}
          </select>
        </div>
        <div className={`hidden rounded-2xl px-3 py-2 lg:block ${
          uiTheme === 'night'
            ? 'border border-white/10 bg-white/5'
            : uiTheme === 'google'
              ? 'border border-slate-200 bg-white'
              : 'border border-amber-200/20 bg-white/88'
        }`}>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
            uiTheme === 'night' ? 'text-slate-400/70' : 'text-slate-400/70'
          }`}>
            {t('companyContext.currentLabel')}
          </p>
          <p className={`text-sm font-medium ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-700'}`}>{getCompanyLabel(currentCompany.code, t)}</p>
        </div>
        <div className={`flex items-center gap-1 rounded-2xl p-1 ${
          uiTheme === 'night'
            ? 'border border-white/10 bg-white/5'
            : uiTheme === 'google'
              ? 'border border-slate-200 bg-white'
              : 'border border-amber-200/20 bg-white/88'
        }`}>
          <button
            type="button"
            onClick={() => handleLanguageChange('zh')}
            className={`rounded px-2 py-1 text-xs ${
              i18n.language === 'zh'
                ? uiTheme === 'google'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : uiTheme === 'night'
                    ? 'bg-amber-400/20 text-amber-300 shadow-sm'
                    : 'bg-amber-500 text-white shadow-sm'
                : uiTheme === 'night'
                  ? 'text-slate-300'
                  : 'text-slate-500'
            }`}
          >
            {t('langZh')}
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('ja')}
            className={`rounded px-2 py-1 text-xs ${
              i18n.language === 'ja'
                ? uiTheme === 'google'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : uiTheme === 'night'
                    ? 'bg-amber-400/20 text-amber-300 shadow-sm'
                    : 'bg-amber-500 text-white shadow-sm'
                : uiTheme === 'night'
                  ? 'text-slate-300'
                  : 'text-slate-500'
            }`}
          >
            {t('langJa')}
          </button>
        </div>
        <motion.div
          layout
          className={`flex items-center gap-1 rounded-2xl p-1 ${
          uiTheme === 'google'
            ? 'border border-slate-200 bg-white'
            : uiTheme === 'night'
              ? 'border border-white/10 bg-white/5'
              : 'border border-amber-200/20 bg-white/88'
        }`}>
          <button
            type="button"
            onClick={() => setUiTheme('google')}
            className={`rounded-lg px-2.5 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 ${
              uiTheme === 'google' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setUiTheme('jtech')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 ${
              uiTheme === 'jtech' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={12} />
            J-Tech
          </button>
          <button
            type="button"
            onClick={() => setUiTheme('night')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 ${
              uiTheme === 'night' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <MoonStar size={12} />
            Night
          </button>
        </motion.div>
        <button aria-label={t('nav.notifications')} className={`relative rounded-2xl p-2 transition duration-200 hover:-translate-y-0.5 ${
          uiTheme === 'night' ? 'text-slate-300 hover:bg-white/8' : uiTheme === 'google' ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-500 hover:bg-amber-50'
        }`}>
          <Bell size={18} className={uiTheme === 'night' ? 'text-slate-300' : 'text-slate-500'} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
            uiTheme === 'night'
              ? 'border border-white/10 bg-amber-400/12'
              : uiTheme === 'google'
                ? 'border border-slate-200 bg-slate-100'
                : 'border border-amber-200/25 bg-amber-100/60'
          }`}>
            <User size={16} className={uiTheme === 'night' ? 'text-amber-300' : uiTheme === 'google' ? 'text-slate-600' : 'text-amber-700'} />
          </div>
          <span className={`text-sm ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-700'}`}>{user?.nickname || user?.username || t('userFallback')}</span>
        </div>
        <button
          onClick={handleLogout}
          aria-label={t('logout')}
          className={`rounded-2xl p-2 transition duration-200 hover:-translate-y-0.5 ${
            uiTheme === 'night' ? 'text-slate-300 hover:bg-white/8' : uiTheme === 'google' ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-500 hover:bg-amber-50'
          }`}
        >
          <LogOut size={18} className={uiTheme === 'night' ? 'text-slate-300' : 'text-slate-500'} />
        </button>
      </div>
    </header>
  );
}
