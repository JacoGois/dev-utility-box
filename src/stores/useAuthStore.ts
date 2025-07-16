import { AUTH_TOKEN_KEY } from "@/lib/constants";
import httpClient from "@/utils/httpClient";
import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUserProfile = async (): Promise<User> => {
  const response = await httpClient.get("/auth/me");
  return response.data.data as User;
};

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

interface AuthActions {
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  token: null,
  user: null,
  loading: true,

  login: async (token) => {
    set({ token, loading: true });
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);

    try {
      const user = await fetchUserProfile();
      set({ user, loading: false });
    } catch {
      get().logout();
    }
  },

  logout: () => {
    set({ token: null, user: null, loading: false });
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  },
}));

const initializeAuth = async () => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    useAuthStore.setState({ token });
    try {
      const user = await fetchUserProfile();
      useAuthStore.setState({ user, loading: false });
    } catch {
      useAuthStore.getState().logout();
    }
  } else {
    useAuthStore.setState({ loading: false });
  }
};

if (typeof window !== "undefined") {
  initializeAuth();
}
