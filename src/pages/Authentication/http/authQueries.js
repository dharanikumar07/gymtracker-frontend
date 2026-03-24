import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    loginApi, 
    registerApi, 
    forgotPasswordApi, 
    resetPasswordApi, 
    verifyEmailApi, 
    socialCallbackApi,
    fetchMeApi
} from './authApi';
import { useAuthStore } from '../../../store/authStore';
import { QUERY_KEYS } from '../../../constants/query.constants';

export const useUserQuery = () => {
    const { setUser, setLoading } = useAuthStore();
    return useQuery({
        queryKey: QUERY_KEYS.AUTH.USER,
        queryFn: async () => {
            try {
                const response = await fetchMeApi();
                const user = response.data?.data || response.data?.user || response.data;
                setUser(user);
                return user;
            } catch (err) {
                // Only clear local auth on explicit unauthorized response.
                if (err?.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                }
                throw err;
            } finally {
                setLoading(false);
            }
        },
        enabled: !!localStorage.getItem('access_token'), // Only run if we think we are logged in
        retry: false,
    });
};

export const useLoginMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: loginApi,
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useRegisterMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: registerApi,
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useForgotPasswordMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useResetPasswordMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useVerifyEmailMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: ({ uuid, hash }) => verifyEmailApi(uuid, hash),
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useSocialCallbackMutation = (onSuccess, onError) => {
    return useMutation({
        mutationFn: ({ provider, code }) => socialCallbackApi(provider, code),
        onSuccess: (response) => {
            if (onSuccess) onSuccess(response.data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};
