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
      privateKey: null,

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

      setPrivateKey: (key) => set({ privateKey: key }),

      // Logout
      logout: () => {
        set({
          access_token: null,
          refresh_token: null,
          token_type: null,
          expires_in: null,
          user: null,
          privateKey: null,
        });
      },

      // Refresh Access Token
      refreshAccessToken: async () => {
        const { refresh_token, logout } = get();
        
        if (!refresh_token) {
          logout();
          return false;
        }

        try {
          const response = await fetch("https://whisperbox.koyeb.app/auth/refresh", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();
          
          set({
            access_token: data.access_token,
            token_type: data.token_type,
            expires_in: data.expires_in,
          });
          
          return true;
        } catch (error) {
          console.error("Error refreshing token:", error);
          logout();
          return false;
        }
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
