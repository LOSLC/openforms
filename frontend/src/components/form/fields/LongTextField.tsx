import React from 'react';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const LongTextField: React.FC<BaseFieldProps> = ({
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
      <textarea
        id={field.id}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        required={field.required}
        rows={4}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-base resize-y min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground ${validationError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-ring focus:ring-ring'}`}
        aria-describedby={field.description ? `${field.id}-desc` : undefined}
        maxLength={field.text_bounds ? Number(field.text_bounds.split(':')[1]) || undefined : undefined}
      />
    </FieldWrapper>
  );
};
