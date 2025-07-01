import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formsService } from "../services/forms";
import { adminService } from "../services/admin";
import { FormCreationRequest, FormFieldCreationRequest } from "../api";

// Admin form management hooks
export const useGetAllForms = (skip: number = 0, limit: number = 10) => {
  return useQuery({
    queryKey: ["forms", "all", skip, limit],
    queryFn: () => adminService.getAllForms(skip, limit),
  });
};

export const useGetUserForms = (skip: number = 0, limit: number = 10) => {
  return useQuery({
    queryKey: ["forms", "user", skip, limit],
    queryFn: () => adminService.getUserForms(skip, limit),
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormCreationRequest) => adminService.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      data,
    }: { formId: string; data: FormCreationRequest }) =>
      adminService.updateForm(formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", variables.formId] });
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: string) => adminService.deleteForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};

export const useCloseForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: string) => adminService.closeForm(formId),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
  });
};

export const useOpenForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: string) => adminService.openForm(formId),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
  });
};

// Form field management hooks
export const useCreateFormField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      data,
    }: { formId: string; data: Omit<FormFieldCreationRequest, "form_id"> }) =>
      adminService.addFieldToForm(formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form", variables.formId, "fields"],
      });
      queryClient.invalidateQueries({ queryKey: ["form", variables.formId] });
    },
  });
};

export const useUpdateFormField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: string;
      formId: string;
      data: Omit<FormFieldCreationRequest, "form_id">;
    }) => adminService.updateFormField(fieldId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form", variables.formId, "fields"],
      });
      queryClient.invalidateQueries({ queryKey: ["form", variables.formId] });
    },
  });
};

export const useDeleteFormField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId }: { fieldId: string; formId: string }) =>
      adminService.deleteFormField(fieldId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form", variables.formId, "fields"],
      });
      queryClient.invalidateQueries({ queryKey: ["form", variables.formId] });
    },
  });
};

// Public form access hooks
export const useGetForm = (formId: string) => {
  return useQuery({
    queryKey: ["form", formId],
    queryFn: () => formsService.getForm(formId),
    enabled: !!formId,
  });
};

export const useGetFormFields = (formId: string) => {
  return useQuery({
    queryKey: ["form", formId, "fields"],
    queryFn: () => formsService.getFormFields(formId),
    enabled: !!formId,
  });
};

// Response submission hooks
export const useSubmitResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.submitResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useEditResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, value }: { answerId: string; value: string }) =>
      formsService.editResponse(answerId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useDeleteResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.deleteResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

// Session management hooks
export const useGetAnswerSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => formsService.getAnswerSession(sessionId),
    enabled: !!sessionId,
  });
};

export const useSubmitSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.submitSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useSubmitCurrentSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.submitCurrentSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};
