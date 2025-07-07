import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVerifyAccount = () => {
  return useMutation({
    mutationFn: authService.verifyAccount,
  });
};

export const useVerifyLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.verifyLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: authService.sendVerificationEmail,
  });
};

export const useVerifyLoginOtp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.verifyLoginOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
