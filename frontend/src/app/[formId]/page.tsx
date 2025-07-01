'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetForm, useGetFormFields, useSubmitResponse, useSubmitCurrentSession } from '@/lib/hooks/useForms';
import Link from 'next/link';
import { Loader2, CheckCircle, Home, ArrowLeft } from 'lucide-react';

interface FormResponse {
  [fieldId: string]: string | undefined;
}

interface FormField {
  id: string;
  label: string;
  description?: string;
  field_type: 'Text' | 'Numerical' | 'Boolean' | 'Select' | 'Multiselect';
  required: boolean;
  possible_answers?: string | null;
  number_bounds?: string | null;
  text_bounds?: string | null;
}

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;
  
  const [responses, setResponses] = useState<FormResponse>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { data: form, isLoading: formLoading } = useGetForm(formId);
  const { data: fields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const submitResponseMutation = useSubmitResponse();
  const submitSessionMutation = useSubmitCurrentSession();

  const validateField = (field: FormField, value: string): string | null => {
    // Check if required field is empty
    if (field.required && (!value || value.trim() === '')) {
      return `${field.label} is required`;
    }

    // Skip validation for empty optional fields
    if (!value || value.trim() === '') {
      return null;
    }

    switch (field.field_type) {
      case 'Text':
        if (field.text_bounds) {
          const [min, max] = field.text_bounds.split(':').map(Number);
          if (min && value.length < min) {
            return `${field.label} must be at least ${min} characters`;
          }
          if (max && value.length > max) {
            return `${field.label} must be no more than ${max} characters`;
          }
        }
        break;

      case 'Numerical':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `${field.label} must be a valid number`;
        }
        if (field.number_bounds) {
          const [min, max] = field.number_bounds.split(':').map(Number);
          if (min !== undefined && numValue < min) {
            return `${field.label} must be at least ${min}`;
          }
          if (max !== undefined && numValue > max) {
            return `${field.label} must be no more than ${max}`;
          }
        }
        break;

      case 'Select':
        if (field.required && !value) {
          return `Please select an option for ${field.label}`;
        }
        break;

      case 'Multiselect':
        if (field.required && (!value || value.split(',').filter(v => v.trim()).length === 0)) {
          return `Please select at least one option for ${field.label}`;
        }
        break;

      case 'Boolean':
        if (field.required && value === '') {
          return `Please select an option for ${field.label}`;
        }
        break;
    }

    return null;
  };

  const validateAllFields = (): boolean => {
    if (!fields) return false;
    
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
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

    try {
      await submitSessionMutation.mutateAsync();
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit session:', error);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id] || '';

    switch (field.field_type) {
      case 'Text':
        return (
          <div key={field.id} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700" id={`${field.id}-label`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              required={field.required}
              className={`h-11 text-base ${validationErrors[field.id] ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={field.description ? `${field.id}-desc` : undefined}
              maxLength={field.text_bounds ? Number(field.text_bounds.split(':')[1]) || undefined : undefined}
            />
            {validationErrors[field.id] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {validationErrors[field.id]}
              </p>
            )}
          </div>
        );

      case 'Numerical':
        return (
          <div key={field.id} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700" id={`${field.id}-label`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Only allow valid numbers or empty string
                if (inputValue === '' || !isNaN(Number(inputValue))) {
                  handleFieldChange(field.id, inputValue || null);
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
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              required={field.required}
              min={field.number_bounds?.split(':')[0]}
              max={field.number_bounds?.split(':')[1]}
              step="any"
              className={`h-11 text-base ${validationErrors[field.id] ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={field.description ? `${field.id}-desc` : undefined}
            />
            {validationErrors[field.id] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {validationErrors[field.id]}
              </p>
            )}
          </div>
        );

      case 'Boolean':
        return (
          <div key={field.id} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700" id={`${field.id}-label`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
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
                className={`p-4 border rounded-lg hover:bg-gray-50 transition-all cursor-pointer ${
                  value === '1' 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : validationErrors[field.id] ? 'border-red-200' : 'border-gray-200'
                }`}
                onClick={() => handleFieldChange(field.id, '1')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFieldChange(field.id, '1');
                  }
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2">
                    {value === '1' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                    <span id={`${field.id}-yes-label`} className={`text-center font-medium ${value === '1' ? 'text-blue-700' : ''}`}>Yes</span>
                  </div>
                </div>
              </div>
              
              <div
                role="radio"
                aria-checked={value === '0'}
                tabIndex={0}
                aria-labelledby={`${field.id}-no-label`}
                className={`p-4 border rounded-lg hover:bg-gray-50 transition-all cursor-pointer ${
                  value === '0' 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : validationErrors[field.id] ? 'border-red-200' : 'border-gray-200'
                }`}
                onClick={() => handleFieldChange(field.id, '0')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFieldChange(field.id, '0');
                  }
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2">
                    {value === '0' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                    <span id={`${field.id}-no-label`} className={`text-center font-medium ${value === '0' ? 'text-blue-700' : ''}`}>No</span>
                  </div>
                </div>
              </div>
            </div>
            {validationErrors[field.id] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {validationErrors[field.id]}
              </p>
            )}
          </div>
        );

      case 'Select':
        const options = field.possible_answers?.split(',') || [];
        return (
          <div key={field.id} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700" id={`${field.id}-label`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
            <Select
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string, index: number) => (
                  <SelectItem key={index} value={option.trim()} className="text-base py-3">
                    {option.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'Multiselect':
        const multiOptions = field.possible_answers?.split(',') || [];
        const selectedValues = value ? value.split(',') : [];
        
        return (
          <div key={field.id} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <p className="text-sm font-medium text-gray-600 mb-3">Select all that apply:</p>
              {multiOptions.map((option: string, index: number) => {
                const optionValue = option.trim();
                const isSelected = selectedValues.includes(optionValue);
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
                    <Checkbox
                      id={`${field.id}-${index}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        let newValues;
                        if (checked) {
                          newValues = [...selectedValues, optionValue];
                        } else {
                          newValues = selectedValues.filter(v => v !== optionValue);
                        }
                        handleFieldChange(field.id, newValues.join(','));
                      }}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`${field.id}-${index}`} className="text-base font-normal cursor-pointer flex-1">
                      {optionValue}
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
          </div>
        );

      default:
        return null;
    }
  };

  if (formLoading || fieldsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form || !fields) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Form not found</h3>
            <p className="text-gray-600 mb-6">
              The form you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button className="w-full h-11">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-16">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Thank you!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your response has been submitted successfully. We appreciate your participation.
            </p>
            <Link href="/">
              <Button className="w-full h-11">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8 pt-8 sm:pt-12 px-6 sm:px-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {form.label}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8 sm:pb-12">
            <div className="space-y-8">
              {fields.map(renderField)}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-200">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              
              <Button 
                onClick={handleSubmit}
                disabled={submitSessionMutation.isPending}
                className="w-full sm:w-auto h-11 px-8 text-base font-medium"
              >
                {submitSessionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </div>
            
            {submitSessionMutation.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">
                  Failed to submit form. Please check your responses and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
