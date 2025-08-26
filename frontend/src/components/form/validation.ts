import { FormField } from './types';

export const validateField = (field: FormField, value: string): string | null => {
  // Check if required field is empty
  if (field.required && (!value || value.trim() === '')) {
    return `${field.label} is required`;
  }

  // Skip validation for empty optional fields
  if (!value || value.trim() === '') {
    return null;
  }

  switch (field.field_type) {
    case 'Text':
    case 'LongText':
    case 'Alpha':
    case 'Alphanum':
      if (field.text_bounds) {
        const [min, max] = field.text_bounds.split(':').map(Number);
        if (min && value.length < min) {
          return `${field.label} must be at least ${min} characters`;
        }
        if (max && value.length > max) {
          return `${field.label} must be no more than ${max} characters`;
        }
      }
      
      // Additional validation for Alpha and Alphanum
      if (field.field_type === 'Alpha' && !/^[a-zA-Z\s]*$/.test(value)) {
        return `${field.label} must contain only letters and spaces`;
      }
      if (field.field_type === 'Alphanum' && !/^[a-zA-Z0-9\s]*$/.test(value)) {
        return `${field.label} must contain only letters, numbers, and spaces`;
      }
      break;

    case 'Numerical':
    case 'Currency':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.field_type === 'Currency' && numValue < 0) {
        return `${field.label} must be a positive value`;
      }
      if (field.number_bounds) {
        const [min, max] = field.number_bounds.split(':').map(Number);
        if (min !== undefined && numValue < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `${field.label} must be no more than ${max}`;
        }
      }
      break;

    case 'Email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field.label} must be a valid email address`;
      }
      break;

    case 'Phone':
      // Validate phone number in international format (starts with +)
      if (!value.startsWith('+')) {
        return `${field.label} must be a valid international phone number`;
      }
      // Basic validation - should be at least 10 digits after the +
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        return `${field.label} must be a valid phone number`;
      }
      break;

    case 'URL':
      try {
        new URL(value);
      } catch {
        return `${field.label} must be a valid URL`;
      }
      break;

    case 'Date':
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return `${field.label} must be a valid date`;
      }
      break;

    case 'Select':
      if (field.required && !value) {
        return `Please select an option for ${field.label}`;
      }
      break;

    case 'Multiselect':
      if (field.required && (!value || value.split(',').filter(v => v.trim()).length === 0)) {
        return `Please select at least one option for ${field.label}`;
      }
      break;

    case 'Boolean':
      if (field.required && value === '') {
        return `Please select an option for ${field.label}`;
      }
      break;
  }

  return null;
};
