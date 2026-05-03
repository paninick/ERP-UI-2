import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Bell, LogOut, Search, User } from 'lucide-react';
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
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="w-36 bg-transparent text-sm outline-none lg:w-48"
          />
        </div>
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 xl:flex">
          <div className="pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {t('companyContext.title')}
            </p>
            <p className="text-xs text-slate-500">{t('companyContext.subtitle')}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white p-1 shadow-sm">
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
                    active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
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
        <div className="hidden rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
            {t('companyContext.currentLabel')}
          </p>
          <p className="text-sm font-medium text-indigo-700">{getCompanyLabel(currentCompany.code, t)}</p>
        </div>
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
