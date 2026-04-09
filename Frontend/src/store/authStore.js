import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setTokens: (token, refreshToken) => {
                localStorage.setItem('token', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                set({ token, refreshToken });
            },

            login: (user, token, refreshToken) => {
                set({
                    user,
                    token,
                    refreshToken,
                    isAuthenticated: true
                });
                localStorage.setItem('token', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false
                });
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            },

            setLoading: (isLoading) => set({ isLoading }),

            // Initialize from localStorage
            initialize: () => {
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');
                if (token) {
                    set({ token, refreshToken, isAuthenticated: true });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
