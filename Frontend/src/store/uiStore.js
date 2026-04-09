import { create } from 'zustand';

const useUIStore = create((set) => ({
    // Cart drawer
    isCartDrawerOpen: false,
    openCartDrawer: () => set({ isCartDrawerOpen: true }),
    closeCartDrawer: () => set({ isCartDrawerOpen: false }),
    toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

    // Mobile menu
    isMobileMenuOpen: false,
    openMobileMenu: () => set({ isMobileMenuOpen: true }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

    // Search
    isSearchOpen: false,
    openSearch: () => set({ isSearchOpen: true }),
    closeSearch: () => set({ isSearchOpen: false }),

    // Location
    selectedLocation: null,
    setLocation: (location) => set({ selectedLocation: location }),
}));

export default useUIStore;
