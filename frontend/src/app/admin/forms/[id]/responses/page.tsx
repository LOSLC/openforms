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
      case 'Currency':
        const numValue = parseFloat(value);
        return isNaN(numValue) ? value : `$${numValue.toFixed(2)}`;
      case 'Date':
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch {
          return value;
        }
      case 'Email':
      case 'Phone':
      case 'URL':
      case 'Text':
      case 'Numerical':
      case 'Alpha':
      case 'Alphanum':
      default:
        return value;
    }
  };

  const exportToCSV = () => {
    if (!responses || responses.length === 0) return;

    // Get all unique fields and sort them by position
    const allFieldsMap = new Map<string, { label: string; position: number | null }>();
    responses.forEach(session => {
      session.answers.forEach(answer => {
        if (!allFieldsMap.has(answer.field.label)) {
          allFieldsMap.set(answer.field.label, {
            label: answer.field.label,
            position: answer.field.position
          });
        }
      });
    });

    // Sort fields by position and extract labels
    const sortedFieldLabels = Array.from(allFieldsMap.values())
      .sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      })
      .map(field => field.label);

    const headers = ['Submission ID', 'Submitted', ...sortedFieldLabels];
    
    // Create CSV rows
    const csvRows = [
      headers.join(','),
      ...responses.map(session => {
        const row = [
          session.id,
          session.submitted ? 'Yes' : 'No'
        ];
        
        // Add answer values for each field in position order
        sortedFieldLabels.forEach(fieldLabel => {
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
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Form not found</h1>
          <p className="text-muted-foreground mb-4">The form you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/forms">
            <Button>Back to Forms</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 lg:h-16 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link href={`/admin/forms/${formId}`}>
                <Button variant="ghost" size="sm" className="font-medium">
                  ← Back to Form
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  Form Responses
                </h1>
                <p className="text-sm text-muted-foreground truncate max-w-xs sm:max-w-none">
                  {form.label}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full lg:w-auto">
              {responses && responses.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToCSV} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
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
            <CardTitle className="text-lg sm:text-xl">Search Responses</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Search through form responses by answer content or field name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <Input
                  id="search"
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSkip(Math.max(0, skip - limit))}
                    disabled={skip === 0}
                    className="flex-1 sm:flex-none"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSkip(skip + limit)}
                    disabled={!responses || responses.length < limit}
                    className="flex-1 sm:flex-none"
                  >
                    Next →
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {skip + 1} - {Math.min(skip + limit, (responses?.length || 0) + skip)}
                </span>
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
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-3 bg-muted rounded"></div>
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
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">
                        Response #{session.id.slice(-8)}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Status: {session.submitted ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">✓ Submitted</span>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 font-medium">○ In Progress</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.answers
                      .sort((a, b) => {
                        const posA = a.field.position ?? 999999;
                        const posB = b.field.position ?? 999999;
                        return posA - posB;
                      })
                      .map((answer) => (
                      <div key={answer.id} className="border-l-4 border-primary/30 pl-3 sm:pl-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm sm:text-base">
                              {answer.field.label}
                              {answer.field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </h4>
                            {answer.field.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                {answer.field.description}
                              </p>
                            )}
                            <p className="text-foreground text-sm sm:text-base break-words">
                              {formatAnswerValue(
                                answer.value, 
                                answer.field.field_type, 
                                answer.field.possible_answers
                              )}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0 self-start lg:ml-4">
                            {answer.field.field_type}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {session.answers.length === 0 && (
                      <p className="text-muted-foreground italic text-sm">No answers provided yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No matching responses' : 'No responses yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No responses match "${searchTerm}". Try a different search term.`
                  : 'No one has submitted responses to this form yet.'
                }
              </p>
              {!searchTerm && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link href={`/${formId}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Preview Form
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${formId}`}>
                    <Button className="w-full sm:w-auto">
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
