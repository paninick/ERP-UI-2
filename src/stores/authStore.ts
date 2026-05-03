import {create} from 'zustand';
import client from '@/api/client';
import { useAppStore } from '@/stores/appStore';
import { buildCompanyContextOptionsFromBackend, hasPersistedCompanyContext, resolveDefaultCompanyContext } from '@/utils/companyContext';

interface UserInfo {
  userId: number;
  deptId?: number;
  username: string;
  nickname: string;
  roles: string[];
  permissions: string[];
  erpCompanyContexts?: any[];
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  login: (username: string, password: string, code?: string, uuid?: string) => Promise<void>;
  logout: () => void;
  getInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,

  login: async (username, password, code, uuid) => {
    const res: any = await client.post('/login', { username, password, code, uuid });
    const token = res.token;
    localStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('token');
    useAppStore.getState().resetCurrentCompany();
    set({ token: null, user: null });
  },

  getInfo: async () => {
    const res: any = await client.get('/getInfo');
    const backendCompanyContexts = Array.isArray(res.erpCompanyContexts) ? res.erpCompanyContexts : [];
    const companyOptions = buildCompanyContextOptionsFromBackend(backendCompanyContexts, []);
    const nextSelection = resolveDefaultCompanyContext(
      useAppStore.getState().currentCompany,
      companyOptions,
      res.user?.userId === 1 ? null : res.user?.deptId,
      hasPersistedCompanyContext({
        userId: res.user?.userId,
        deptId: res.user?.deptId,
      })
    );

    if (!nextSelection) {
      useAppStore.getState().resetCurrentCompany();
      localStorage.removeItem('token');
      set({ token: null, user: null });
      throw new Error('未配置默认公司上下文');
    }

    useAppStore.getState().setCurrentCompany(nextSelection, {
      userId: res.user?.userId,
      deptId: res.user?.deptId,
    });

    set({
      user: {
        userId: res.user.userId,
        deptId: res.user.deptId,
        username: res.user.userName,
        nickname: res.user.nickName,
        roles: res.roles,
        permissions: res.permissions,
        erpCompanyContexts: backendCompanyContexts,
      },
    });
  },
}));
