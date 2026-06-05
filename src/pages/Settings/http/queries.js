import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfileApi, updateProfileApi } from './api';
import { toast } from 'sonner';

export const useProfileQuery = () => {
    return useQuery({
        queryKey: ['settings', 'profile'],
        queryFn: fetchProfileApi,
    });
};

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfileApi,
        onSuccess: (res) => {
            queryClient.setQueryData(['settings', 'profile'], res);
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    });
};
