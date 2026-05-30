import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useVendorStore = create(
    persist(
        (set) => ({
            // State
            vendor: null,   // user object (id, email, name, role)
            store: null,    // store profile object
            token: null,
            isVendor: false,

            // Actions
            login: (vendor, store, token) => {
                localStorage.setItem('vendor-token', token);
                set({ vendor, store, token, isVendor: true });
            },

            logout: () => {
                localStorage.removeItem('vendor-token');
                set({ vendor: null, store: null, token: null, isVendor: false });
            },

            setStore: (store) => set({ store }),

            setVendor: (vendor) => set({ vendor }),
        }),
        {
            name: 'vendor-storage',
            partialize: (state) => ({
                vendor: state.vendor,
                store: state.store,
                token: state.token,
                isVendor: state.isVendor,
            }),
        }
    )
);

export default useVendorStore;
