import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const AlphanumField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  validationError,
  wrapWithTranslation
}) => {
  return (
    <FieldWrapper 
      field={field} 
      validationError={validationError} 
      wrapWithTranslation={wrapWithTranslation}
    >
      <Input
        id={field.id}
        value={value}
        onChange={(e) => {
          // Only allow letters, numbers, and spaces
          const alphanumValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
          onChange(field.id, alphanumValue);
        }}
        placeholder="e.g. A1B2C3"
        required={field.required}
        className={`h-11 text-base ${validationError ? 'border-destructive focus:border-destructive' : ''}`}
      />
    </FieldWrapper>
  );
};
