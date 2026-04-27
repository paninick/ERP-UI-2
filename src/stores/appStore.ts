import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setAutoCollapse: (collapsed: boolean) => void;
  dictCache: Record<string, any[]>;
  setDict: (type: string, data: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAutoCollapse: (collapsed) => set({ sidebarCollapsed: collapsed }),
  dictCache: {},
  setDict: (type, data) => set((s) => ({ dictCache: { ...s.dictCache, [type]: data } })),
}));
