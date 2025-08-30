'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetForm, useGetFormFields, useSubmitResponse, useSubmitCurrentSession, useTranslateForm } from '@/lib/hooks/useForms';
import { useHoverTranslation } from '@/lib/hooks/useHoverTranslation';
import { FormHead } from '@/components/FormHead';
import { TranslatableText } from '@/components/TranslatableText';
import { SupportedLanguages, FormTranslationDTO } from '@/lib/api';
import {
  FormLoadingState,
  FormNotFoundState,
  FormSuccessState,
  FormHeader,
  TranslationControls,
  FormFieldList,
  FormSubmission,
  FormField,
  FormResponse
} from '@/components/form';
import { validateField } from '@/components/form/validation';

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;
  
  const [responses, setResponses] = useState<FormResponse>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [translatedContent, setTranslatedContent] = useState<FormTranslationDTO | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalFieldsMap, setOriginalFieldsMap] = useState<Record<string, FormField>>({});
  const [hoverTranslationLanguage, setHoverTranslationLanguage] = useState<SupportedLanguages | null>(null);
  const [translationMethod, setTranslationMethod] = useState<'hover' | 'full'>('hover');
  
  // Initialize hover translation hook
  const {
    translateText,
    clearCache,
    isEnabled: hoverTranslationEnabled,
    setIsEnabled: setHoverTranslationEnabled,
  } = useHoverTranslation();
  
  const { data: form, isLoading: formLoading } = useGetForm(formId);
  const { data: fields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const submitResponseMutation = useSubmitResponse();
  const submitSessionMutation = useSubmitCurrentSession();
  const translateFormMutation = useTranslateForm();

  // Use translated content if available, otherwise use original
  const currentForm = isTranslated && translatedContent ? translatedContent.form : form;
  const currentFields = isTranslated && translatedContent ? translatedContent.fields : fields;

  // Store original fields when they're loaded
  useEffect(() => {
    if (fields && !isTranslated) {
      const fieldsMap: Record<string, FormField> = {};
      fields.forEach(field => {
        fieldsMap[field.id] = field;
      });
      setOriginalFieldsMap(fieldsMap);
    }
  }, [fields, isTranslated]);

  const handleTranslate = async (language: SupportedLanguages) => {
    try {
      const translated = await translateFormMutation.mutateAsync({ formId, language });
      setTranslatedContent(translated);
      setIsTranslated(true);
      
      // If hover translation was enabled, disable it when using full form translation
      if (hoverTranslationEnabled) {
        setHoverTranslationEnabled(false);
        setHoverTranslationLanguage(null);
        clearCache();
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const handleResetTranslation = () => {
    setIsTranslated(false);
    setTranslatedContent(null);
    setHoverTranslationEnabled(false);
    setHoverTranslationLanguage(null);
    clearCache();
  };

  const handleHoverTranslationToggle = (enabled: boolean, language: SupportedLanguages | null) => {
    setHoverTranslationEnabled(enabled);
    setHoverTranslationLanguage(language);
    
    if (enabled && language) {
      // If enabling hover translation, reset full form translation
      if (isTranslated) {
        setIsTranslated(false);
        setTranslatedContent(null);
      }
    } else {
      // Clear cache when disabling
      clearCache();
    }
  };

  const handleTranslationMethodChange = (method: 'hover' | 'full') => {
    setTranslationMethod(method);
  };

  // Helper function to wrap text with TranslatableText component
  const wrapWithTranslation = (text: string, children: React.ReactNode, className?: string) => {
    if (translationMethod === 'full' || !hoverTranslationEnabled || !hoverTranslationLanguage) {
      return children;
    }
    
    return (
      <TranslatableText
        text={text}
        onTranslate={translateText}
        language={hoverTranslationLanguage}
        isEnabled={hoverTranslationEnabled}
        className={className}
      >
        {children}
      </TranslatableText>
    );
  };

  // Helper function to map translated option back to original value
  // This ensures that when users select translated options, we store the original values
  const mapTranslatedToOriginal = (fieldId: string, translatedValue: string): string => {
    if (!isTranslated || !translatedContent) return translatedValue;
    
    const originalField = originalFieldsMap[fieldId];
    const translatedField = translatedContent.fields.find(f => f.id === fieldId);
    
    if (!originalField || !translatedField || !originalField.possible_answers || !translatedField.possible_answers) {
      return translatedValue;
    }

    const originalOptions = originalField.possible_answers.split('\\').map(opt => opt.trim());
    const translatedOptions = translatedField.possible_answers.split('\\').map(opt => opt.trim());
    
    const translatedIndex = translatedOptions.indexOf(translatedValue);
    return translatedIndex >= 0 && translatedIndex < originalOptions.length 
      ? originalOptions[translatedIndex] 
      : translatedValue;
  };

  // Helper function to map original value to translated display
  // This ensures that stored values are displayed in the translated language
  const mapOriginalToTranslated = (fieldId: string, originalValue: string): string => {
    if (!isTranslated || !translatedContent) return originalValue;
    
    const originalField = originalFieldsMap[fieldId];
    const translatedField = translatedContent.fields.find(f => f.id === fieldId);
    
    if (!originalField || !translatedField || !originalField.possible_answers || !translatedField.possible_answers) {
      return originalValue;
    }

    const originalOptions = originalField.possible_answers.split('\\').map(opt => opt.trim());
    const translatedOptions = translatedField.possible_answers.split('\\').map(opt => opt.trim());
    
    const originalIndex = originalOptions.indexOf(originalValue);
    return originalIndex >= 0 && originalIndex < translatedOptions.length 
      ? translatedOptions[originalIndex] 
      : originalValue;
  };

  const validateAllFields = (): boolean => {
    if (!currentFields) return false;
    
    const errors: Record<string, string> = {};
    
    currentFields.forEach(field => {
      const value = responses[field.id] || '';
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = async (fieldId: string, value: string | null) => {
    setResponses(prev => ({ ...prev, [fieldId]: value || undefined }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    // Don't submit empty values
    if (value === null || value === '') {
      return;
    }
    
    try {
      await submitResponseMutation.mutateAsync({
        field_id: fieldId,
        value,
      });
    } catch (error) {
      console.error('Failed to submit response:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      return; // Don't submit if validation fails
    }

    if (!currentFields) return;

    setIsSubmittingAll(true);
    setSubmitError(null);

    try {
      // Resend all non-empty field values to ensure backend is up to date
      for (const field of currentFields) {
        const value = responses[field.id];
        // Skip empty values (prevents invalid Boolean "" etc.)
        if (value === undefined || value === null || value === '') continue;
        await submitResponseMutation.mutateAsync({
          field_id: field.id,
          value,
        });
      }

      // Finalize submission
      await submitSessionMutation.mutateAsync();
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit session:', error);
      setSubmitError(error as Error);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  if (formLoading || fieldsLoading) {
    return (
      <>
        <FormHead form={currentForm || null} />
        <FormLoadingState />
      </>
    );
  }

  if (!form || !fields) {
    return (
      <>
        <FormHead form={null} />
        <FormNotFoundState />
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <FormHead form={currentForm || null} submitted={true} />
        <FormSuccessState />
      </>
    );
  }

  return (
    <>
      <FormHead form={currentForm || null} />
      <div className="min-h-screen bg-background py-4 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border-border">
            <FormHeader
              title={currentForm?.label || undefined}
              description={currentForm?.description || undefined}
              wrapWithTranslation={wrapWithTranslation}
            />
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-12">
              <TranslationControls
                isTranslated={isTranslated}
                isTranslating={translateFormMutation.isPending}
                translationError={translateFormMutation.error}
                disabled={submitted}
                hoverTranslationEnabled={hoverTranslationEnabled}
                translationMethod={translationMethod}
                onTranslate={handleTranslate}
                onResetTranslation={handleResetTranslation}
                onHoverTranslationToggle={handleHoverTranslationToggle}
                onTranslationMethodChange={handleTranslationMethodChange}
              />

              {currentFields && (
                <FormFieldList
                  fields={currentFields}
                  responses={responses}
                  validationErrors={validationErrors}
                  isTranslated={isTranslated}
                  onFieldChange={handleFieldChange}
                  wrapWithTranslation={wrapWithTranslation}
                  mapOriginalToTranslated={mapOriginalToTranslated}
                  mapTranslatedToOriginal={mapTranslatedToOriginal}
                />
              )}
              
              <FormSubmission
                onSubmit={handleSubmit}
                isSubmitting={isSubmittingAll}
                error={submitError ?? submitSessionMutation.error}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
