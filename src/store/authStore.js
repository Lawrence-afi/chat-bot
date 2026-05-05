import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://whisperbox.koyeb.app";

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

      setUser: (user) => set({ user }),

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
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              Accept: "application/json",
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

      fetchCurrentUser: async () => {
        const { access_token, refreshAccessToken, logout } = get();

        if (!access_token) {
          logout();
          return false;
        }

        const fetchUser = async (token) => {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const error = new Error("Failed to fetch current user");
            error.status = response.status;
            throw error;
          }

          return response.json();
        };

        try {
          const data = await fetchUser(access_token);
          set({ user: data });
          return true;
        } catch (error) {
          if (error?.status === 401) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              logout();
              return false;
            }

            try {
              const data = await fetchUser(get().access_token);
              set({ user: data });
              return true;
            } catch (innerError) {
              console.error("Failed to fetch current user after refresh:", innerError);
              logout();
              return false;
            }
          }

          console.error("Error fetching current user:", error);
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
      }),

      // Track hydration (important for SSR / first load)
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
