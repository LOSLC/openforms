import React from 'react';
import { Label } from '@/components/ui/label';
import { BaseFieldProps } from './types';

interface FieldWrapperProps extends Pick<BaseFieldProps, 'field' | 'validationError' | 'wrapWithTranslation'> {
  children: React.ReactNode;
  htmlFor?: string;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  field,
  validationError,
  wrapWithTranslation,
  children,
  htmlFor
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label 
          htmlFor={htmlFor || field.id} 
          className="text-sm font-medium text-foreground" 
          id={`${field.id}-label`}
        >
          {wrapWithTranslation(field.label, field.label)}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">
            {wrapWithTranslation(field.description, field.description)}
          </p>
        )}
      </div>
      {children}
      {validationError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span>⚠</span> {validationError}
        </p>
      )}
    </div>
  );
};
