import React from 'react';
import { Label } from '@/components/ui/label';
import { BaseFieldProps } from '../types';

export const BooleanField: React.FC<BaseFieldProps> = ({
  field,
  value,
  onChange,
  validationError,
  wrapWithTranslation
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-foreground" id={`${field.id}-label`}>
          {wrapWithTranslation(field.label, field.label)}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">
            {wrapWithTranslation(field.description, field.description)}
          </p>
        )}
      </div>
      <div 
        className="grid grid-cols-2 gap-3"
        role="radiogroup"
        aria-labelledby={`${field.id}-label`}
        aria-required={field.required}
      >
        <div
          role="radio"
          aria-checked={value === '1'}
          tabIndex={0}
          aria-labelledby={`${field.id}-yes-label`}
          className={`p-4 border rounded-lg hover:bg-accent/50 transition-all cursor-pointer ${
            value === '1' 
              ? 'border-primary bg-primary/10 shadow-sm' 
              : validationError ? 'border-destructive/50' : 'border-border'
          }`}
          onClick={() => onChange(field.id, '1')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(field.id, '1');
            }
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              {value === '1' && (
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              )}
              <span id={`${field.id}-yes-label`} className={`text-center font-medium ${value === '1' ? 'text-primary' : 'text-foreground'}`}>
                {wrapWithTranslation('Yes', 'Yes')}
              </span>
            </div>
          </div>
        </div>
        
        <div
          role="radio"
          aria-checked={value === '0'}
          tabIndex={0}
          aria-labelledby={`${field.id}-no-label`}
          className={`p-4 border rounded-lg hover:bg-accent/50 transition-all cursor-pointer ${
            value === '0' 
              ? 'border-primary bg-primary/10 shadow-sm' 
              : validationError ? 'border-destructive/50' : 'border-border'
          }`}
          onClick={() => onChange(field.id, '0')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(field.id, '0');
            }
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              {value === '0' && (
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              )}
              <span id={`${field.id}-no-label`} className={`text-center font-medium ${value === '0' ? 'text-primary' : 'text-foreground'}`}>
                {wrapWithTranslation('No', 'No')}
              </span>
            </div>
          </div>
        </div>
      </div>
      {validationError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span>⚠</span> {validationError}
        </p>
      )}
    </div>
  );
};
