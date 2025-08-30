import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { FormCreationRequest, FormFieldCreationRequest } from '../api';

// Form management hooks
export const useGetAllForms = (skip = 0, limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'forms', 'all', skip, limit],
    queryFn: () => adminService.getAllForms(skip, limit),
  });
};

export const useGetUserForms = (skip = 0, limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'forms', 'user', skip, limit],
    queryFn: () => adminService.getUserForms(skip, limit),
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.createForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Partial<FormCreationRequest> }) => 
      adminService.updateForm(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
      queryClient.invalidateQueries({ queryKey: ['form'] });
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
    },
  });
};

export const useCloseForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.closeForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
      queryClient.invalidateQueries({ queryKey: ['form'] });
    },
  });
};

export const useOpenForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.openForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
      queryClient.invalidateQueries({ queryKey: ['form'] });
    },
  });
};

// Field management hooks
export const useGetFormFields = (formId: string) => {
  return useQuery({
    queryKey: ['admin', 'forms', formId, 'fields'],
    queryFn: () => adminService.getFormFields(formId),
    enabled: !!formId,
  });
};

export const useAddFieldToForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Omit<FormFieldCreationRequest, 'form_id'> }) => 
      adminService.addFieldToForm(formId, data),
    onSuccess: (_, { formId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms', formId, 'fields'] });
      queryClient.invalidateQueries({ queryKey: ['form', formId, 'fields'] });
    },
  });
};

export const useUpdateFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: string; data: Omit<FormFieldCreationRequest, 'form_id'> }) => 
      adminService.updateFormField(fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
      queryClient.invalidateQueries({ queryKey: ['form'] });
    },
  });
};

export const useDeleteFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteFormField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forms'] });
      queryClient.invalidateQueries({ queryKey: ['form'] });
    },
  });
};

// Response management hooks
export const useGetFormResponses = (formId: string, skip = 0, limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'forms', formId, 'responses', skip, limit],
    queryFn: () => adminService.getFormResponses(formId, skip, limit),
    enabled: !!formId,
  });
};

export const useExportFormResponsesCsv = () => {
  return useMutation({
    mutationFn: (formId: string) => adminService.exportFormResponsesCsv(formId),
  });
};
