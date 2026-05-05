import { create } from 'zustand';
import {
  clearPersistedCompanyContext,
  DEFAULT_COMPANY_CONTEXT,
  type CompanyContextIdentity,
  type CompanyContextSelection,
  loadCompanyContext,
  persistCompanyContext,
} from '@/utils/companyContext';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setAutoCollapse: (collapsed: boolean) => void;
  uiTheme: 'google' | 'jtech' | 'night';
  setUiTheme: (theme: 'google' | 'jtech' | 'night') => void;
  dictCache: Record<string, any[]>;
  setDict: (type: string, data: any[]) => void;
  currentCompany: CompanyContextSelection;
  setCurrentCompany: (selection: CompanyContextSelection, identity?: CompanyContextIdentity) => void;
  resetCurrentCompany: () => void;
}

const UI_THEME_STORAGE_KEY = 'erp-ui-theme';

function loadUiTheme(): 'google' | 'jtech' | 'night' {
  if (typeof window === 'undefined') {
    return 'google';
  }
  const stored = window.localStorage.getItem(UI_THEME_STORAGE_KEY);
  if (stored === 'night') {
    return 'night';
  }
  return stored === 'jtech' ? 'jtech' : 'google';
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAutoCollapse: (collapsed) => set({ sidebarCollapsed: collapsed }),
  uiTheme: loadUiTheme(),
  setUiTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(UI_THEME_STORAGE_KEY, theme);
    }
    set({ uiTheme: theme });
  },
  dictCache: {},
  setDict: (type, data) => set((s) => ({ dictCache: { ...s.dictCache, [type]: data } })),
  currentCompany: loadCompanyContext(),
  setCurrentCompany: (selection, identity) => {
    persistCompanyContext(selection, identity);
    set({ currentCompany: selection });
  },
  resetCurrentCompany: () => {
    clearPersistedCompanyContext();
    set({ currentCompany: DEFAULT_COMPANY_CONTEXT });
  },
}));
