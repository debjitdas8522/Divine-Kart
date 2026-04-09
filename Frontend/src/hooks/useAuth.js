import { getProfile } from '@/services/authService';
import useAuthStore from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for authentication
 * Provides auth state and actions
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setUser,
        setLoading,
        initialize,
    } = useAuthStore();

    // Fetch user profile if authenticated but no user data
    const { data: profileData, isFetching: isFetchingProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: isAuthenticated && !user,
        retry: false,
    });

    const isInternalLoading = isLoading || (isAuthenticated && !user && isFetchingProfile);

    // Update user data when profile is fetched
    if (profileData && !user) {
        setUser(profileData.data || profileData);
    }

    return {
        user,
        isAuthenticated,
        isLoading: isInternalLoading,
        login,
        logout,
        setUser,
        setLoading,
        initialize,
    };
};

export default useAuth;
