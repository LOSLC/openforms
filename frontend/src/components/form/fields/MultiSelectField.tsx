import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BaseFieldProps } from '../types';

interface MultiSelectFieldProps extends BaseFieldProps {
  isTranslated?: boolean;
  mapOriginalToTranslated?: (fieldId: string, value: string) => string;
  mapTranslatedToOriginal?: (fieldId: string, value: string) => string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  field,
  value,
  onChange,
  validationError,
  wrapWithTranslation,
  isTranslated = false,
  mapOriginalToTranslated,
  mapTranslatedToOriginal
}) => {
  const multiOptions = field.possible_answers?.split('\\') || [];
  const selectedValues = value ? value.split(',') : [];
  // Map original values to translated for display
  const selectedDisplayValues = isTranslated && mapOriginalToTranslated
    ? selectedValues.map(val => mapOriginalToTranslated(field.id, val)) 
    : selectedValues;
  
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-foreground">
          {wrapWithTranslation(field.label, field.label)}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">
            {wrapWithTranslation(field.description, field.description)}
          </p>
        )}
      </div>
      <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
        <p className="text-sm font-medium text-foreground mb-3">Select all that apply:</p>
        {multiOptions.map((option: string, index: number) => {
          const optionValue = option.trim();
          const isSelected = selectedDisplayValues.includes(optionValue);
          
          return (
            <div key={index} className="flex items-center space-x-3 p-3 bg-card border border-border rounded-md hover:border-border/80 transition-colors">
              <Checkbox
                id={`${field.id}-${index}`}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  // Map translated option back to original value
                  const originalOptionValue = isTranslated && mapTranslatedToOriginal
                    ? mapTranslatedToOriginal(field.id, optionValue) 
                    : optionValue;
                  
                  let newValues;
                  if (checked) {
                    newValues = [...selectedValues, originalOptionValue];
                  } else {
                    newValues = selectedValues.filter(v => v !== originalOptionValue);
                  }
                  onChange(field.id, newValues.join(','));
                }}
                className="h-5 w-5"
              />
              <Label htmlFor={`${field.id}-${index}`} className="text-base font-normal cursor-pointer flex-1 text-foreground">
                {wrapWithTranslation(optionValue, optionValue)}
              </Label>
            </div>
          );
        })}
        {selectedValues.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {selectedValues.length} option{selectedValues.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
      {validationError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span>⚠</span> {validationError}
        </p>
      )}
    </div>
  );
};
