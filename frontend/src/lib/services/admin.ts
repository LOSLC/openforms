import { 
  api, 
  FormDTO, 
  FormFieldDTO, 
  AnswerSessionDTO, 
  FormCreationRequest, 
  FormFieldCreationRequest,
  MessageResponse 
} from '../api';

export const adminService = {
  // Form management
  getAllForms: async (skip = 0, limit = 10): Promise<FormDTO[]> => {
    return api.get('api/v1/forms', { 
      searchParams: { skip: skip.toString(), limit: limit.toString() } 
    }).json();
  },

  getUserForms: async (skip = 0, limit = 10): Promise<FormDTO[]> => {
    return api.get('api/v1/forms/my', { 
      searchParams: { skip: skip.toString(), limit: limit.toString() } 
    }).json();
  },

  createForm: async (data: FormCreationRequest): Promise<FormDTO> => {
    return api.post('api/v1/forms', { json: data }).json();
  },

  updateForm: async (formId: string, data: Partial<FormCreationRequest>): Promise<FormDTO> => {
    return api.put(`api/v1/forms/${formId}`, { json: data }).json();
  },

  deleteForm: async (formId: string): Promise<MessageResponse> => {
    return api.delete(`api/v1/forms/${formId}`).json();
  },

  closeForm: async (formId: string): Promise<MessageResponse> => {
    return api.post(`api/v1/forms/${formId}/close`).json();
  },

  openForm: async (formId: string): Promise<MessageResponse> => {
    return api.post(`api/v1/forms/${formId}/open`).json();
  },

  // Field management
  getFormFields: async (formId: string): Promise<FormFieldDTO[]> => {
    return api.get(`api/v1/forms/${formId}/fields`).json();
  },

  addFieldToForm: async (formId: string, data: Omit<FormFieldCreationRequest, 'form_id'>): Promise<FormFieldDTO> => {
    return api.post(`api/v1/forms/${formId}/fields`, { 
      json: { ...data, form_id: formId } 
    }).json();
  },

  updateFormField: async (fieldId: string, data: Partial<FormFieldCreationRequest>): Promise<FormFieldDTO> => {
    return api.put(`api/v1/forms/fields/${fieldId}`, { json: data }).json();
  },

  deleteFormField: async (fieldId: string): Promise<MessageResponse> => {
    return api.delete(`api/v1/forms/fields/${fieldId}`).json();
  },

  // Response management
  getFormResponses: async (formId: string, skip = 0, limit = 10): Promise<AnswerSessionDTO[]> => {
    return api.get(`api/v1/forms/${formId}/responses`, { 
      searchParams: { skip: skip.toString(), limit: limit.toString() } 
    }).json();
  },
};
