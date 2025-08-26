import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const TextField: React.FC<BaseFieldProps> = ({
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
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        required={field.required}
        className={`h-11 text-base ${validationError ? 'border-destructive focus:border-destructive' : ''}`}
        aria-describedby={field.description ? `${field.id}-desc` : undefined}
        maxLength={field.text_bounds ? Number(field.text_bounds.split(':')[1]) || undefined : undefined}
      />
    </FieldWrapper>
  );
};
