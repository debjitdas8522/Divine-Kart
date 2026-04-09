import { getCart } from '@/services/cartService';
import useCartStore from '@/store/cartStore';
import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';

/**
 * Custom hook for cart management
 * Provides cart state and actions
 */
export const useCart = () => {
    const { isAuthenticated } = useAuth();

    const {
        items,
        total,
        subtotal,
        deliveryFee,
        discount,
        setCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        calculateTotals,
        getItemCount,
    } = useCartStore();

    // Sync cart with server if authenticated
    const { data: serverCart } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: isAuthenticated,
        onSuccess: (data) => {
            if (data) {
                setCart(data);
            }
        },
    });

    const itemCount = getItemCount();

    return {
        items,
        total,
        subtotal,
        deliveryFee,
        discount,
        itemCount,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        setCart,
        calculateTotals,
    };
};

export default useCart;
