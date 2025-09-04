import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const EmailField: React.FC<BaseFieldProps> = ({
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
        type="email"
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder="e.g. name@example.com"
        required={field.required}
        className={`h-11 text-base ${validationError ? 'border-destructive focus:border-destructive' : ''}`}
      />
    </FieldWrapper>
  );
};
