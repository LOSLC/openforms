import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

export const NumericalField: React.FC<BaseFieldProps> = ({
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
        type="number"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value;
          // Only allow valid numbers or empty string
          if (inputValue === '' || !isNaN(Number(inputValue))) {
            onChange(field.id, inputValue || null);
          }
        }}
        onKeyDown={(e) => {
          // Prevent non-numeric characters except backspace, delete, tab, escape, enter, and decimal point
          if (!/[0-9]/.test(e.key) && 
              !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
              !(e.key === '.' && !value.includes('.')) && // Allow decimal point if not already present
              !(e.key === '-' && value === '')) { // Allow minus sign only at the beginning
            e.preventDefault();
          }
        }}
        placeholder={(() => {
          const [min, max] = (field.number_bounds || '').split(':');
          if (min && max) return `e.g. ${min} - ${max}`;
          if (min) return `e.g. ≥ ${min}`;
          if (max) return `e.g. ≤ ${max}`;
          return 'e.g. 42';
        })()}
        required={field.required}
        min={field.number_bounds?.split(':')[0]}
        max={field.number_bounds?.split(':')[1]}
        step="any"
        className={`h-11 text-base ${validationError ? 'border-destructive focus:border-destructive' : ''}`}
        aria-describedby={field.description ? `${field.id}-desc` : undefined}
      />
    </FieldWrapper>
  );
};
