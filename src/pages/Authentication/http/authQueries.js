import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/authStore';
import { 
    loginApi, 
    registerApi, 
    forgotPasswordApi, 
    resetPasswordApi, 
    verifyEmailApi,
    socialCallbackApi 
} from './authApi';
import { MUTATION_KEYS } from '../../../constants/queryConstants';

/**
 * Hook for Login Mutation
 */
export const useLoginMutation = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.LOGIN],
        mutationFn: (credentials) => loginApi(credentials),
        onSuccess: async (response) => {
            const { user, access_token, refresh_token } = response.data;
            await login(user, access_token, refresh_token);
            toast.success('Welcome back!');
            navigate(user && user.is_onboarding_completed ? '/dashboard' : '/onboarding');
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
        }
    });
};

/**
 * Hook for Registration Mutation
 */
export const useRegisterMutation = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.REGISTER],
        mutationFn: (userData) => registerApi(userData),
        onSuccess: () => {
            toast.success('Registration successful! Please verify your email.');
            navigate('/registration-success');
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    });
};

/**
 * Hook for Forgot Password Mutation
 */
export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.FORGOT_PASSWORD],
        mutationFn: (data) => forgotPasswordApi(data),
        onSuccess: () => {
            toast.success('Reset link sent! Please check your email inbox.');
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to send reset link.');
        }
    });
};

/**
 * Hook for Reset Password Mutation
 */
export const useResetPasswordMutation = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.RESET_PASSWORD],
        mutationFn: (data) => resetPasswordApi(data),
        onSuccess: () => {
            toast.success('Password updated successfully. You can now sign in.');
            navigate('/login');
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        }
    });
};

/**
 * Hook for Email Verification Mutation
 */
export const useVerifyEmailMutation = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.VERIFY_EMAIL],
        mutationFn: ({ uuid, hash }) => verifyEmailApi(uuid, hash),
        onSuccess: async (response) => {
            const { user, access_token, refresh_token } = response.data;
            if (access_token) {
                await login(user, access_token, refresh_token);
            }
            toast.success('Email verified successfully! Welcome to GymOS.');
            navigate(user.is_onboarding_completed ? '/dashboard' : '/onboarding');
        },
        onError: (err) => {
            console.error(err);
            toast.error('Verification failed. Link may be invalid or expired.');
        }
    });
};

/**
 * Hook for Social Login Callback Mutation
 */
export const useSocialCallbackMutation = (provider) => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationKey: [MUTATION_KEYS.AUTH.SOCIAL_CALLBACK, provider],
        mutationFn: (code) => socialCallbackApi(provider, code),
        onSuccess: async (response) => {
            const { user, access_token, refresh_token } = response.data;
            await login(user, access_token, refresh_token);
            toast.success(`Welcome back, ${user.name || 'Athlete'}!`);
            navigate(user && user.is_onboarding_completed ? '/dashboard' : '/onboarding');
        },
        onError: (err) => {
            console.error('Social auth error:', err);
            toast.error('Social authentication failed');
            setTimeout(() => navigate('/login'), 2000);
        }
    });
};
