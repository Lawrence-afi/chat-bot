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

      // Set auth data (login/signup)
      setAuth: (data) => {
        set({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          user: data.user,
        });
      },

      // Logout
      logout: () => {
        set({
          access_token: null,
          refresh_token: null,
          token_type: null,
          expires_in: null,
          user: null,
        });
      },

      // Check if user is logged in
      isAuthenticated: () => {
        return !!get().access_token;
      },

      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "auth-storage",

      // Persist only what matters
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        token_type: state.token_type,
        expires_in: state.expires_in,
        user: state.user,
      }),

      // Track hydration (important for SSR / first load)
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
