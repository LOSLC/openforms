'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetForm } from '@/lib/hooks/useForms';
import { useGetFormResponses } from '@/lib/hooks/useAdmin';
import { AnswerSessionDTO } from '@/lib/api';
import { Download, BarChart3, Loader2 } from 'lucide-react';

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [skip, setSkip] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data: form, isLoading: formLoading } = useGetForm(formId);
  const { data: responses, isLoading: responsesLoading } = useGetFormResponses(formId, skip, limit);

  // Filter responses based on search term
  const filteredResponses = responses?.filter((session: AnswerSessionDTO) => {
    if (!searchTerm) return true;
    
    return session.answers.some(answer => 
      answer.value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.field.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  const formatAnswerValue = (value: string | null, fieldType: string, possibleAnswers: string | null) => {
    if (value === null || value === undefined) return 'No answer';
    
    switch (fieldType) {
      case 'Boolean':
        return value === '1' ? 'Yes' : 'No';
      case 'Select':
      case 'Multiselect':
        if (possibleAnswers) {
          if (fieldType === 'Multiselect') {
            const selectedValues = value.split(',');
            return selectedValues.map(val => val.trim()).join(', ');
          }
          return value;
        }
        return value;
      default:
        return value;
    }
  };

  const exportToCSV = () => {
    if (!responses || responses.length === 0) return;

    // Get all unique field labels for CSV headers
    const allFields = new Set<string>();
    responses.forEach(session => {
      session.answers.forEach(answer => {
        allFields.add(answer.field.label);
      });
    });

    const headers = ['Submission ID', 'Submitted', ...Array.from(allFields)];
    
    // Create CSV rows
    const csvRows = [
      headers.join(','),
      ...responses.map(session => {
        const row = [
          session.id,
          session.submitted ? 'Yes' : 'No'
        ];
        
        // Add answer values for each field
        Array.from(allFields).forEach(fieldLabel => {
          const answer = session.answers.find(a => a.field.label === fieldLabel);
          const value = answer ? formatAnswerValue(answer.value, answer.field.field_type, answer.field.possible_answers) : '';
          // Escape commas and quotes in CSV
          const escapedValue = value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
          row.push(escapedValue);
        });
        
        return row.join(',');
      })
    ];

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form?.label || 'form'}_responses.csv`;
    link.click();
  };

  if (formLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h1>
          <p className="text-gray-600 mb-4">The form you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/forms">
            <Button>Back to Forms</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/forms/${formId}`}>
                <Button variant="ghost">
                  ← Back to Form
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Form Responses
                </h1>
                <p className="text-sm text-gray-600">
                  {form.label}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {responses && responses.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
              <span className="text-sm text-gray-600">
                {responses?.length || 0} responses
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Responses</CardTitle>
            <CardDescription>
              Search through form responses by answer content or field name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip === 0}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-gray-600">
                  {skip + 1} - {Math.min(skip + limit, (responses?.length || 0) + skip)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setSkip(skip + limit)}
                  disabled={!responses || responses.length < limit}
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        {responsesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResponses.length > 0 ? (
          <div className="space-y-4">
            {filteredResponses.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Response #{session.id.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        Status: {session.submitted ? (
                          <span className="text-green-600 font-medium">✓ Submitted</span>
                        ) : (
                          <span className="text-orange-600 font-medium">○ In Progress</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.answers.map((answer) => (
                      <div key={answer.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {answer.field.label}
                              {answer.field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </h4>
                            {answer.field.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {answer.field.description}
                              </p>
                            )}
                            <p className="text-gray-800">
                              {formatAnswerValue(
                                answer.value, 
                                answer.field.field_type, 
                                answer.field.possible_answers
                              )}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {answer.field.field_type}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {session.answers.length === 0 && (
                      <p className="text-gray-500 italic">No answers provided yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-gray-400 h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching responses' : 'No responses yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `No responses match "${searchTerm}". Try a different search term.`
                  : 'No one has submitted responses to this form yet.'
                }
              </p>
              {!searchTerm && (
                <div className="space-x-2">
                  <Link href={`/${formId}`}>
                    <Button variant="outline">
                      Preview Form
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${formId}`}>
                    <Button>
                      Edit Form
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
