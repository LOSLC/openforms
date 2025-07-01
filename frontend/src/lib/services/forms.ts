import {
  api,
  FormDTO,
  FormFieldDTO,
  FieldResponseDTO,
  AnswerSessionDTO,
  ResponseCreationRequest,
  MessageResponse,
} from "../api";

export const formsService = {
  // Public form access
  getForm: async (formId: string): Promise<FormDTO> => {
    return api.get(`api/v1/forms/${formId}`).json();
  },

  getFormFields: async (formId: string): Promise<FormFieldDTO[]> => {
    return api.get(`api/v1/forms/${formId}/fields`).json();
  },

  // Response submission
  submitResponse: async (
    data: ResponseCreationRequest,
  ): Promise<FieldResponseDTO> => {
    return api.post("api/v1/forms/responses", { json: data }).json();
  },

  editResponse: async (answerId: string, value: string): Promise<void> => {
    return api
      .put(`api/v1/forms/responses/${answerId}`, {
        json: { value },
      })
      .json();
  },

  deleteResponse: async (answerId: string): Promise<MessageResponse> => {
    return api.delete(`api/v1/forms/responses/${answerId}`).json();
  },

  // Session management
  getAnswerSession: async (sessionId: string): Promise<AnswerSessionDTO> => {
    return api.get(`api/v1/forms/sessions/${sessionId}`).json();
  },

  submitSession: async (sessionId: string): Promise<MessageResponse> => {
    return api.post(`api/v1/forms/sessions/${sessionId}/submit`).json();
  },

  // Submit session using cookie (no sessionId required)
  submitCurrentSession: async (): Promise<MessageResponse> => {
    return api.post('api/v1/forms/sessions/submit').json();
  },
};
