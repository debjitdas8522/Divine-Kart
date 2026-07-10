import { create } from "zustand";
import { persist } from "zustand/middleware";

const useVendorStore = create(
    persist(
        (set) => ({
            vendor: null,
            store: null,
            token: null,

            login: ({ vendor, store, token }) => {
                set({
                    vendor,
                    store,
                    token,
                });
            },

            logout: () => {
                set({
                    vendor: null,
                    store: null,
                    token: null,
                });
            },

            setVendor: (vendor) => set({ vendor }),

            setStore: (store) => set({ store }),
        }),
        {
            name: "vendor-storage",
        }
    )
);

export default useVendorStore;