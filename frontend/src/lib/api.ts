import ky from 'ky';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.forms.loslc.tech';

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: 'include',
});

// Types for API responses
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface FormDTO {
  id: string;
  label: string;
  description: string | null;
  fields_length: number;
  open: boolean;
}

export interface FormFieldDTO {
  id: string;
  form_id: string;
  label: string;
  description: string;
  required: boolean;
  field_type: 'Boolean' | 'Numerical' | 'Text' | 'Select' | 'Multiselect';
  possible_answers: string | null;
  number_bounds: string | null;
  text_bounds: string | null;
}

export interface FieldResponseDTO {
  id: string;
  field_id: string;
  session_id: string;
  value: string | null;
  field: FormFieldDTO;
}

export interface AnswerSessionDTO {
  id: string;
  form_id: string;
  answers: FieldResponseDTO[];
  submitted: boolean;
}

export interface MessageResponse {
  message: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  name: string;
}

// Form creation types
export interface FormCreationRequest {
  label: string;
  description?: string;
}

export interface FormFieldCreationRequest {
  form_id: string;
  label: string;
  description: string;
  field_type: 'Boolean' | 'Numerical' | 'Text' | 'Select' | 'Multiselect';
  required?: boolean;
  possible_answers?: string;
  number_bounds?: string;
  text_bounds?: string;
}

export interface ResponseCreationRequest {
  field_id: string;
  value: string | null;
}
