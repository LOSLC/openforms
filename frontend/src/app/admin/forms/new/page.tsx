'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateForm } from '@/lib/hooks/useForms';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submissionsLimit, setSubmissionsLimit] = useState<number | ''>('');
  const createFormMutation = useCreateForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    try {
      const form = await createFormMutation.mutateAsync({
        label: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline ? `${deadline}T00:00:00Z` : undefined,
        submissions_limit: submissionsLimit !== '' ? Number(submissionsLimit) : undefined,
      });
      
      // Redirect to edit the form after creation
      router.push(`/admin/forms/${form.id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 sm:h-16 gap-3 sm:gap-4">
            <Link href="/admin/forms">
              <Button variant="ghost" size="sm" className="font-medium">
                ← Back to Forms
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Create New Form
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Form Details</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new form by providing a title and description. You can add fields after creating the form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Form Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form title..."
                  required
                  maxLength={100}
                  className="mt-1"
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this form is for..."
                  rows={4}
                  maxLength={500}
                  className="mt-1"
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline" className="text-sm font-medium">
                    Deadline (Optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Set when the form should stop accepting submissions
                  </p>
                </div>
                <div>
                  <Label htmlFor="submissions-limit" className="text-sm font-medium">
                    Submissions Limit (Optional)
                  </Label>
                  <Input
                    id="submissions-limit"
                    type="number"
                    min="1"
                    value={submissionsLimit}
                    onChange={(e) => setSubmissionsLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Maximum number of submissions to accept
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-4">
                <Link href="/admin/forms" className="w-full sm:w-auto">
                  <Button variant="outline" type="button" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || createFormMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createFormMutation.isPending ? 'Creating...' : 'Create Form'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {title && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                This is how your form will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h2>
                {description && (
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{description}</p>
                )}
                {(deadline || submissionsLimit !== '') && (
                  <div className="mb-4 space-y-2">
                    {deadline && (
                      <p className="text-sm text-amber-600">
                        📅 Deadline: {new Date(deadline).toLocaleDateString()}
                      </p>
                    )}
                    {submissionsLimit !== '' && (
                      <p className="text-sm text-blue-600">
                        📊 Limited to {submissionsLimit} submissions
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 italic">
                  Form fields will appear here after you add them
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
