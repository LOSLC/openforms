'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetForm, useUpdateForm, useDeleteForm, useGetFormFields, useCreateFormField, useUpdateFormField, useDeleteFormField, useCloseForm, useOpenForm } from '@/lib/hooks/useForms';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FieldFormData {
  label: string;
  description: string;
  field_type: 'Text' | 'Numerical' | 'Boolean' | 'Select' | 'Multiselect';
  required: boolean;
  possible_answers?: string;
  options?: string[];
  number_bounds?: string;
  text_bounds?: string;
}

interface FormFieldData {
  id: string;
  label: string;
  description: string;
  field_type: 'Text' | 'Numerical' | 'Boolean' | 'Select' | 'Multiselect';
  required: boolean;
  possible_answers?: string | null;
  number_bounds?: string | null;
  text_bounds?: string | null;
}

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showNewField, setShowNewField] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState<FieldFormData>({
    label: '',
    description: '',
    field_type: 'Text',
    required: true,
    options: [],
    text_bounds: '',
    number_bounds: '',
  });

  const { data: form, isLoading: formLoading } = useGetForm(formId);
  const { data: fields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const updateFormMutation = useUpdateForm();
  const deleteFormMutation = useDeleteForm();
  const createFieldMutation = useCreateFormField();
  const updateFieldMutation = useUpdateFormField();
  const deleteFieldMutation = useDeleteFormField();
  const closeFormMutation = useCloseForm();
  const openFormMutation = useOpenForm();

  useEffect(() => {
    if (form) {
      setTitle(form.label);
      setDescription(form.description || '');
    }
  }, [form]);

  // Option management functions
  const addOption = () => {
    setFieldForm(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFieldForm(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => i === index ? value : option) || []
    }));
  };

  const removeOption = (index: number) => {
    setFieldForm(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  // Reset options when field type changes away from Select/Multiselect
  const handleFieldTypeChange = (value: FieldFormData['field_type']) => {
    setFieldForm(prev => ({
      ...prev,
      field_type: value,
      options: (value === 'Select' || value === 'Multiselect') ? (prev.options || []) : []
    }));
  };

  // Convert options array to comma-separated string for API and handle bounds
  const prepareFieldData = (data: FieldFormData) => {
    const { options, text_bounds, number_bounds, ...rest } = data;
    
    // Process text bounds - only include if both min and max are provided
    let processedTextBounds: string | undefined = undefined;
    if (text_bounds) {
      const [min, max] = text_bounds.split(':');
      if (min && max && min.trim() !== '' && max.trim() !== '') {
        processedTextBounds = `${min}:${max}`;
      }
    }
    
    // Process number bounds - only include if both min and max are provided
    let processedNumberBounds: string | undefined = undefined;
    if (number_bounds) {
      const [min, max] = number_bounds.split(':');
      if (min && max && min.trim() !== '' && max.trim() !== '') {
        processedNumberBounds = `${min}:${max}`;
      }
    }
    
    return {
      ...rest,
      text_bounds: processedTextBounds,
      number_bounds: processedNumberBounds,
      possible_answers: options && options.length > 0 ? options.filter(opt => opt.trim()).join(', ') : undefined
    };
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFormMutation.mutateAsync({
        formId,
        data: {
          label: title.trim(),
          description: description.trim() || undefined,
        },
      });
    } catch (error) {
      console.error('Failed to update form:', error);
    }
  };

  const handleDeleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteFormMutation.mutateAsync(formId);
      router.push('/admin/forms');
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const handleCloseForm = async () => {
    if (!confirm('Are you sure you want to close this form? Users will no longer be able to submit responses.')) {
      return;
    }

    try {
      await closeFormMutation.mutateAsync(formId);
    } catch (error) {
      console.error('Failed to close form:', error);
    }
  };

  const handleOpenForm = async () => {
    try {
      await openFormMutation.mutateAsync(formId);
    } catch (error) {
      console.error('Failed to open form:', error);
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate options for Select/Multiselect fields
    if ((fieldForm.field_type === 'Select' || fieldForm.field_type === 'Multiselect')) {
      const validOptions = fieldForm.options?.filter(opt => opt.trim()) || [];
      if (validOptions.length === 0) {
        alert('Please add at least one option for this field type.');
        return;
      }
    }
    
    // Validate text bounds - ensure both min and max are provided if either is provided
    if (fieldForm.field_type === 'Text' && fieldForm.text_bounds) {
      const [min, max] = fieldForm.text_bounds.split(':');
      if ((min && min.trim() !== '' && (!max || max.trim() === '')) || 
          (max && max.trim() !== '' && (!min || min.trim() === ''))) {
        alert('Please provide both minimum and maximum values for text length or leave both empty.');
        return;
      }
    }
    
    // Validate number bounds - ensure both min and max are provided if either is provided
    if (fieldForm.field_type === 'Numerical' && fieldForm.number_bounds) {
      const [min, max] = fieldForm.number_bounds.split(':');
      if ((min && min.trim() !== '' && (!max || max.trim() === '')) || 
          (max && max.trim() !== '' && (!min || min.trim() === ''))) {
        alert('Please provide both minimum and maximum values for number range or leave both empty.');
        return;
      }
    }
    
    try {
      await createFieldMutation.mutateAsync({
        formId,
        data: prepareFieldData(fieldForm),
      });
      setFieldForm({
        label: '',
        description: '',
        field_type: 'Text',
        required: true,
        options: [],
        text_bounds: '',
        number_bounds: '',
      });
      setShowNewField(false);
    } catch (error) {
      console.error('Failed to create field:', error);
    }
  };

  const handleUpdateField = async (fieldId: string) => {
    // Validate options for Select/Multiselect fields
    if ((fieldForm.field_type === 'Select' || fieldForm.field_type === 'Multiselect')) {
      const validOptions = fieldForm.options?.filter(opt => opt.trim()) || [];
      if (validOptions.length === 0) {
        alert('Please add at least one option for this field type.');
        return;
      }
    }
    
    // Validate text bounds - ensure both min and max are provided if either is provided
    if (fieldForm.field_type === 'Text' && fieldForm.text_bounds) {
      const [min, max] = fieldForm.text_bounds.split(':');
      if ((min && min.trim() !== '' && (!max || max.trim() === '')) || 
          (max && max.trim() !== '' && (!min || min.trim() === ''))) {
        alert('Please provide both minimum and maximum values for text length or leave both empty.');
        return;
      }
    }
    
    // Validate number bounds - ensure both min and max are provided if either is provided
    if (fieldForm.field_type === 'Numerical' && fieldForm.number_bounds) {
      const [min, max] = fieldForm.number_bounds.split(':');
      if ((min && min.trim() !== '' && (!max || max.trim() === '')) || 
          (max && max.trim() !== '' && (!min || min.trim() === ''))) {
        alert('Please provide both minimum and maximum values for number range or leave both empty.');
        return;
      }
    }
    
    try {
      await updateFieldMutation.mutateAsync({
        fieldId,
        formId,
        data: prepareFieldData(fieldForm),
      });
      setEditingField(null);
      setFieldForm({
        label: '',
        description: '',
        field_type: 'Text',
        required: true,
        options: [],
        text_bounds: '',
        number_bounds: '',
      });
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      await deleteFieldMutation.mutateAsync({ fieldId, formId });
    } catch (error) {
      console.error('Failed to delete field:', error);
    }
  };

  const startEditField = (field: FormFieldData) => {
    setFieldForm({
      label: field.label,
      description: field.description,
      field_type: field.field_type,
      required: field.required,
      possible_answers: field.possible_answers || '',
      options: field.possible_answers ? field.possible_answers.split(', ').map((opt: string) => opt.trim()) : [],
      number_bounds: field.number_bounds || '',
      text_bounds: field.text_bounds || '',
    });
    setEditingField(field.id);
    setShowNewField(false);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setShowNewField(false);
    setFieldForm({
      label: '',
      description: '',
      field_type: 'Text',
      required: true,
      options: [],
      text_bounds: '',
      number_bounds: '',
    });
  };

  if (formLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin absolute" />
            <div className="h-16 w-16 rounded-full bg-blue-100 opacity-50"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Form</h2>
          <p className="text-gray-600">Please wait while we fetch your form data...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Form Not Found</h1>
          <p className="text-gray-600 mb-6">The form you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/admin/forms">
            <Button className="px-6 h-11">
              Back to Forms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 md:h-20 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
              <Link href="/admin/forms">
                <Button variant="ghost" size="sm" className="font-medium">
                  ← Back to Forms
                </Button>
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                  {form.label}
                </h1>                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  form.open 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {form.open ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      <span>Open</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      <span>Closed</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <Link href={`/${formId}`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Preview Form
                </Button>
              </Link>
              {form.open ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCloseForm}
                  disabled={closeFormMutation.isPending}
                  className="text-orange-600 hover:text-orange-700 border-orange-600 hover:border-orange-700 w-full sm:w-auto"
                >
                  {closeFormMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>Closing...</span>
                    </>
                  ) : (
                    'Close Form'
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenForm}
                  disabled={openFormMutation.isPending}
                  className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 w-full sm:w-auto"
                >
                  {openFormMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>Opening...</span>
                    </>
                  ) : (
                    'Open Form'
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteForm}
                disabled={deleteFormMutation.isPending}
                className="w-full sm:w-auto border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                {deleteFormMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Form'
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Form Details */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-gray-800">Form Details</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Update the basic information about your form
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleUpdateForm} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Form Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="Enter form title"
                  aria-describedby="title-description"
                />
                <p id="title-description" className="text-xs text-gray-500">
                  This will be displayed as the main heading of your form
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-y min-h-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="Enter form description (optional)"
                  aria-describedby="desc-description"
                />
                <p id="desc-description" className="text-xs text-gray-500">
                  Provide additional context or instructions for your form
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={updateFormMutation.isPending}
                  className="h-10 px-5 hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                >
                  {updateFormMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Form'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-800">Form Fields</CardTitle>
                <CardDescription className="text-base text-gray-600 mt-1">
                  Add and manage the fields in your form
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setShowNewField(true);
                  setEditingField(null);
                }}
                disabled={showNewField || editingField !== null}
                className="w-full sm:w-auto h-10"
                aria-label="Add new field"
              >
                + Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Field Form */}
            {showNewField && (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-blue-700 flex items-center">
                    <span className="bg-blue-100 p-1 rounded-full mr-2">
                      <span className="block h-5 w-5 text-blue-600">+</span>
                    </span>
                    Add New Field
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <form onSubmit={handleCreateField} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="label" className="text-sm font-medium">Field Label</Label>
                        <Input
                          id="label"
                          value={fieldForm.label}
                          onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                          required
                          className="h-11"
                          placeholder="Enter field label"
                          aria-describedby="label-description"
                        />
                        <p id="label-description" className="text-xs text-gray-500">
                          The main text displayed above the field
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field_type" className="text-sm font-medium">Field Type</Label>
                        <Select
                          value={fieldForm.field_type}
                          onValueChange={handleFieldTypeChange}
                          aria-describedby="type-description"
                        >
                          <SelectTrigger id="field_type" className="h-11">
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Numerical">Number</SelectItem>
                            <SelectItem value="Boolean">Yes/No</SelectItem>
                            <SelectItem value="Select">Single Choice</SelectItem>
                            <SelectItem value="Multiselect">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>
                        <p id="type-description" className="text-xs text-gray-500">
                          Determines the input format and validation
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Input
                        id="description"
                        value={fieldForm.description}
                        onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                        className="h-11"
                        placeholder="Enter field description (optional)"
                        aria-describedby="description-help"
                      />
                      <p id="description-help" className="text-xs text-gray-500">
                        Additional information shown below the field label
                      </p>
                    </div>

                    {(fieldForm.field_type === 'Select' || fieldForm.field_type === 'Multiselect') && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Options</Label>
                          <span className="text-xs text-gray-500">
                            {fieldForm.options?.length || 0} option{(fieldForm.options?.length !== 1) ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {fieldForm.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 group">
                              <div className="bg-white rounded-md border border-gray-200 h-8 w-8 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                              </div>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 h-11"
                                aria-label={`Option ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 opacity-80 group-hover:opacity-100"
                                aria-label={`Remove option ${index + 1}`}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="w-full h-10 bg-white"
                          >
                            + Add Option
                          </Button>
                          
                          {(!fieldForm.options || fieldForm.options.length === 0) && (
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                              Click &quot;Add Option&quot; to create choices for this field.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {fieldForm.field_type === 'Text' && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Label className="text-sm font-medium">Text Length Limits</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 text-sm font-medium">Min</span>
                              <Input
                                type="number"
                                placeholder="No minimum"
                                min="0"
                                value={fieldForm.text_bounds?.split(':')[0] || ''}
                                onChange={(e) => {
                                  const min = e.target.value;
                                  const max = fieldForm.text_bounds?.split(':')[1] || '';
                                  setFieldForm(prev => ({ ...prev, text_bounds: `${min}:${max}` }));
                                }}
                                className="h-10"
                                aria-label="Minimum text length"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Minimum number of characters required</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 text-sm font-medium">Max</span>
                              <Input
                                type="number"
                                placeholder="No maximum"
                                min="0"
                                value={fieldForm.text_bounds?.split(':')[1] || ''}
                                onChange={(e) => {
                                  const min = fieldForm.text_bounds?.split(':')[0] || '';
                                  const max = e.target.value;
                                  setFieldForm(prev => ({ ...prev, text_bounds: `${min}:${max}` }));
                                }}
                                className="h-10"
                                aria-label="Maximum text length"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Maximum number of characters allowed</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {fieldForm.field_type === 'Numerical' && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Label className="text-sm font-medium">Number Range Limits</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 text-sm font-medium">Min</span>
                              <Input
                                type="number"
                                placeholder="No minimum"
                                step="any"
                                value={fieldForm.number_bounds?.split(':')[0] || ''}
                                onChange={(e) => {
                                  const min = e.target.value;
                                  const max = fieldForm.number_bounds?.split(':')[1] || '';
                                  setFieldForm(prev => ({ ...prev, number_bounds: `${min}:${max}` }));
                                }}
                                className="h-10"
                                aria-label="Minimum value"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Lowest value accepted by the field</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 text-sm font-medium">Max</span>
                              <Input
                                type="number"
                                placeholder="No maximum"
                                step="any"
                                value={fieldForm.number_bounds?.split(':')[1] || ''}
                                onChange={(e) => {
                                  const min = fieldForm.number_bounds?.split(':')[0] || '';
                                  const max = e.target.value;
                                  setFieldForm(prev => ({ ...prev, number_bounds: `${min}:${max}` }));
                                }}
                                className="h-10"
                                aria-label="Maximum value"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Highest value accepted by the field</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-lg border border-gray-200 flex items-center space-x-3">
                      <Checkbox
                        id="required"
                        checked={fieldForm.required}
                        onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, required: checked as boolean }))}
                        className="h-5 w-5"
                        aria-describedby="required-description"
                      />
                      <div>
                        <Label htmlFor="required" className="text-sm font-medium cursor-pointer">Required field</Label>
                        <p id="required-description" className="text-xs text-gray-500 mt-1">
                          Users must complete this field before form submission
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        type="submit" 
                        disabled={createFieldMutation.isPending}
                        className="h-11 px-5 w-full sm:w-auto"
                      >
                        {createFieldMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                            <span>Adding Field...</span>
                          </>
                        ) : (
                          'Add Field'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={cancelEdit}
                        className="h-11 px-5 w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Existing Fields */}
            {fieldsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : fields && fields.length > 0 ? (
              <div className="space-y-5 mt-2">
                {fields.map((field) => (
                  <Card key={field.id} className="border hover:border-blue-200 hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-200 focus-within:ring-opacity-50">
                    <CardContent className="p-5">
                      {editingField === field.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdateField(field.id); }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Field Label</Label>
                              <Input
                                value={fieldForm.label}
                                onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label>Field Type</Label>
                              <Select
                                value={fieldForm.field_type}
                                onValueChange={handleFieldTypeChange}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Text">Text</SelectItem>
                                  <SelectItem value="Numerical">Number</SelectItem>
                                  <SelectItem value="Boolean">Yes/No</SelectItem>
                                  <SelectItem value="Select">Single Choice</SelectItem>
                                  <SelectItem value="Multiselect">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={fieldForm.description}
                              onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>

                          {(fieldForm.field_type === 'Select' || fieldForm.field_type === 'Multiselect') && (
                            <div>
                              <Label>Options</Label>
                              <div className="space-y-2">
                                {fieldForm.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(index, e.target.value)}
                                      placeholder={`Option ${index + 1}`}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeOption(index)}
                                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addOption}
                                  className="w-full"
                                >
                                  + Add Option
                                </Button>
                                {(!fieldForm.options || fieldForm.options.length === 0) && (
                                  <p className="text-sm text-gray-500">Click &quot;Add Option&quot; to create choices for this field.</p>
                                )}
                              </div>
                            </div>
                          )}

                          {fieldForm.field_type === 'Text' && (
                            <div>
                              <Label>Text Length Limits</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Input
                                    type="number"
                                    placeholder="Min length"
                                    min="0"
                                    value={fieldForm.text_bounds?.split(':')[0] || ''}
                                    onChange={(e) => {
                                      const min = e.target.value;
                                      const max = fieldForm.text_bounds?.split(':')[1] || '';
                                      setFieldForm(prev => ({ ...prev, text_bounds: `${min}:${max}` }));
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Minimum length (optional)</p>
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    placeholder="Max length"
                                    min="0"
                                    value={fieldForm.text_bounds?.split(':')[1] || ''}
                                    onChange={(e) => {
                                      const min = fieldForm.text_bounds?.split(':')[0] || '';
                                      const max = e.target.value;
                                      setFieldForm(prev => ({ ...prev, text_bounds: `${min}:${max}` }));
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Maximum length (optional)</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {fieldForm.field_type === 'Numerical' && (
                            <div>
                              <Label>Number Range Limits</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Input
                                    type="number"
                                    placeholder="Min value"
                                    step="any"
                                    value={fieldForm.number_bounds?.split(':')[0] || ''}
                                    onChange={(e) => {
                                      const min = e.target.value;
                                      const max = fieldForm.number_bounds?.split(':')[1] || '';
                                      setFieldForm(prev => ({ ...prev, number_bounds: `${min}:${max}` }));
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Minimum value (optional)</p>
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    placeholder="Max value"
                                    step="any"
                                    value={fieldForm.number_bounds?.split(':')[1] || ''}
                                    onChange={(e) => {
                                      const min = fieldForm.number_bounds?.split(':')[0] || '';
                                      const max = e.target.value;
                                      setFieldForm(prev => ({ ...prev, number_bounds: `${min}:${max}` }));
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Maximum value (optional)</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={fieldForm.required}
                              onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, required: checked as boolean }))}
                            />
                            <Label>Required field</Label>
                          </div>

                          <div className="flex space-x-2">
                            <Button type="submit" disabled={updateFieldMutation.isPending}>
                              {updateFieldMutation.isPending ? 'Updating...' : 'Update Field'}
                            </Button>
                            <Button type="button" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h4 className="font-semibold text-lg text-gray-800">{field.label}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${field.field_type === 'Text' ? 'bg-blue-100 text-blue-800' : 
                                field.field_type === 'Numerical' ? 'bg-green-100 text-green-800' :
                                field.field_type === 'Boolean' ? 'bg-purple-100 text-purple-800' :
                                field.field_type === 'Select' ? 'bg-amber-100 text-amber-800' :
                                'bg-pink-100 text-pink-800'}`}
                              >
                                {field.field_type}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                field.required ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}
                              >
                                {field.required ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            
                            {field.description && (
                              <p className="text-sm text-gray-600 mb-3">{field.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-3 text-xs">
                              {field.possible_answers && (
                                <div className="px-3 py-1.5 bg-gray-100 rounded-md">
                                  <span className="font-medium text-gray-700">Options:</span>{' '}
                                  <span className="text-gray-600">{field.possible_answers}</span>
                                </div>
                              )}
                              {field.text_bounds && field.field_type === 'Text' && (
                                <div className="px-3 py-1.5 bg-blue-50 rounded-md">
                                  <span className="font-medium text-blue-700">Length:</span>{' '}
                                  <span className="text-blue-600">{field.text_bounds.replace(':', ' to ')} chars</span>
                                </div>
                              )}
                              {field.number_bounds && field.field_type === 'Numerical' && (
                                <div className="px-3 py-1.5 bg-green-50 rounded-md">
                                  <span className="font-medium text-green-700">Range:</span>{' '}
                                  <span className="text-green-600">{field.number_bounds.replace(':', ' to ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditField(field)}
                              disabled={showNewField || editingField !== null}
                              className="h-9 px-3"
                              aria-label={`Edit ${field.label} field`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteField(field.id)}
                              disabled={deleteFieldMutation.isPending}
                              className="h-9 px-3 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              aria-label={`Delete ${field.label} field`}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No fields added yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Start building your form by adding fields like text inputs, checkboxes, or dropdown menus.
                </p>
                <Button 
                  onClick={() => {
                    setShowNewField(true);
                    setEditingField(null);
                  }}
                  disabled={showNewField || editingField !== null}
                  className="px-5 h-10"
                >
                  + Add Your First Field
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
