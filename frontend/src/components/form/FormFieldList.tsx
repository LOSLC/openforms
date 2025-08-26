import React from 'react';
import { FieldRenderer } from './FieldRenderer';
import { FormField, FormResponse } from './types';

interface FormFieldListProps {
  fields: FormField[];
  responses: FormResponse;
  validationErrors: Record<string, string>;
  isTranslated: boolean;
  onFieldChange: (fieldId: string, value: string | null) => void;
  wrapWithTranslation: (text: string, children: React.ReactNode, className?: string) => React.ReactNode;
  mapOriginalToTranslated?: (fieldId: string, value: string) => string;
  mapTranslatedToOriginal?: (fieldId: string, value: string) => string;
}

export const FormFieldList: React.FC<FormFieldListProps> = ({
  fields,
  responses,
  validationErrors,
  isTranslated,
  onFieldChange,
  wrapWithTranslation,
  mapOriginalToTranslated,
  mapTranslatedToOriginal
}) => {
  // Sort fields by position
  const sortedFields = [...fields].sort((a, b) => {
    const posA = a.position ?? 999999;
    const posB = b.position ?? 999999;
    return posA - posB;
  });

  return (
    <div className="space-y-8">
      {sortedFields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={responses[field.id] || ''}
          onChange={onFieldChange}
          validationError={validationErrors[field.id]}
          wrapWithTranslation={wrapWithTranslation}
          isTranslated={isTranslated}
          mapOriginalToTranslated={mapOriginalToTranslated}
          mapTranslatedToOriginal={mapTranslatedToOriginal}
        />
      ))}
    </div>
  );
};
