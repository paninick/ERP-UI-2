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
  dictCache: Record<string, any[]>;
  setDict: (type: string, data: any[]) => void;
  currentCompany: CompanyContextSelection;
  setCurrentCompany: (selection: CompanyContextSelection, identity?: CompanyContextIdentity) => void;
  resetCurrentCompany: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAutoCollapse: (collapsed) => set({ sidebarCollapsed: collapsed }),
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
