import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      token_type: null,
      expires_in: null,
      user: null,
      hydrated: false,
      setAuth: (data) =>
        set(() => ({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          user: data.user,
        })),
      refreshTokens: ({ access_token, refresh_token, expires_in }) =>
        set((state) => ({
          access_token: access_token ?? state.access_token,
          refresh_token: refresh_token ?? state.refresh_token,
          expires_in: expires_in ?? state.expires_in,
        })),
      logout: () =>
        set({
          access_token: null,
          refresh_token: null,
          token_type: null,
          expires_in: null,
          user: null,
        }),
      isAuthenticated: () => Boolean(get().access_token),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "wb-auth-storage",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (name) => window.localStorage.getItem(name),
              setItem: (name, value) =>
                window.localStorage.setItem(name, value),
              removeItem: (name) => window.localStorage.removeItem(name),
            }
          : undefined,
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        token_type: state.token_type,
        expires_in: state.expires_in,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export default useAuthStore;
