import React from 'react';
import { PhoneInput } from '@/components/ui/phone-input';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const PhoneField: React.FC<BaseFieldProps> = ({
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
      <PhoneInput
        value={value}
        onChange={(val) => onChange(field.id, val || '')}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        className={validationError ? 'border-destructive' : ''}
        aria-describedby={field.description ? `${field.id}-desc` : undefined}
      />
    </FieldWrapper>
  );
};
