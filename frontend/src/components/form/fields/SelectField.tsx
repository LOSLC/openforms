import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldWrapper } from '../FieldWrapper';
import { BaseFieldProps } from '../types';

interface SelectFieldProps extends BaseFieldProps {
  isTranslated?: boolean;
  mapOriginalToTranslated?: (fieldId: string, value: string) => string;
  mapTranslatedToOriginal?: (fieldId: string, value: string) => string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  validationError,
  wrapWithTranslation,
  isTranslated = false,
  mapOriginalToTranslated,
  mapTranslatedToOriginal
}) => {
  const options = field.possible_answers?.split('\\') || [];
  const selectDisplayValue = isTranslated && mapOriginalToTranslated 
    ? mapOriginalToTranslated(field.id, value) 
    : value;
  
  return (
    <FieldWrapper 
      field={field} 
      validationError={validationError} 
      wrapWithTranslation={wrapWithTranslation}
    >
      <Select
        value={selectDisplayValue}
        onValueChange={(newValue) => {
          // Map translated value back to original before storing
          const originalValue = isTranslated && mapTranslatedToOriginal 
            ? mapTranslatedToOriginal(field.id, newValue) 
            : newValue;
          onChange(field.id, originalValue);
        }}
      >
        <SelectTrigger className="h-11 text-base">
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: string, index: number) => {
            const optionText = option.trim();
            return (
              <SelectItem key={index} value={optionText} className="text-base py-3">
                {wrapWithTranslation(optionText, optionText)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};
