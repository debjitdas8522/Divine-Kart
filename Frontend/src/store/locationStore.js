/**
 * locationStore.js — Persists the customer's selected delivery location.
 *
 * Shape of `location` object:
 * {
 *   label: string,   // Display text  e.g. "Koramangala, Bangalore"
 *   pincode: string, // e.g. "560034"
 *   city: string,    // e.g. "Bangalore"
 *   lat: number | null,
 *   lng: number | null,
 * }
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLocationStore = create(
    persist(
        (set) => ({
            location: null, // null = not yet selected

            setLocation: (location) => set({ location }),
            clearLocation: () => set({ location: null }),
        }),
        {
            name: 'dk-delivery-location',
        }
    )
);

export default useLocationStore;
