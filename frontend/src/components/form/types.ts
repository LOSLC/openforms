export interface FormField {
  id: string;
  label: string;
  description?: string;
  field_type: 'Text' | 'LongText' | 'Numerical' | 'Boolean' | 'Select' | 'Multiselect' | 'Email' | 'Phone' | 'Currency' | 'Date' | 'URL' | 'Alpha' | 'Alphanum';
  required: boolean;
  possible_answers?: string | null;
  number_bounds?: string | null;
  text_bounds?: string | null;
  position?: number | null;
}

export interface FormResponse {
  [fieldId: string]: string | undefined;
}

export interface BaseFieldProps {
  field: FormField;
  value: string;
  onChange: (fieldId: string, value: string | null) => void;
  validationError?: string;
  wrapWithTranslation: (text: string, children: React.ReactNode, className?: string) => React.ReactNode;
}
