import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserApi, updateUserApi } from './api';
import { toast } from 'sonner';

export const useUserQuery = () => {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: fetchUserApi,
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUserApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Profile updated successfully');
        },
        onError: (error) => toast.error(error.response?.data?.errors || 'Failed to update profile'),
    });
};
