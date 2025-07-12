'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Search, Clock, Users } from 'lucide-react';

// Mock data for now - in a real app this would come from an API
const mockForms = [
  {
    id: '1',
    title: 'Customer Feedback Survey',
    description: 'Help us improve our services by sharing your experience with us.',
    fields_count: 8,
    created_at: '2024-01-15',
    response_count: 156,
  },
  {
    id: '2',
    title: 'Event Registration Form',
    description: 'Register for our upcoming annual conference and networking event.',
    fields_count: 12,
    created_at: '2024-01-10',
    response_count: 89,
  },
  {
    id: '3',
    title: 'Job Application Form',
    description: 'Apply for open positions at our company. We\'re always looking for talented individuals.',
    fields_count: 15,
    created_at: '2024-01-08',
    response_count: 42,
  },
  {
    id: '4',
    title: 'Newsletter Subscription',
    description: 'Stay updated with our latest news, updates, and exclusive content.',
    fields_count: 5,
    created_at: '2024-01-05',
    response_count: 234,
  },
  {
    id: '5',
    title: 'Product Feature Request',
    description: 'Suggest new features or improvements for our products and services.',
    fields_count: 6,
    created_at: '2024-01-03',
    response_count: 67,
  },
  {
    id: '6',
    title: 'Bug Report Form',
    description: 'Report any issues or bugs you encounter while using our platform.',
    fields_count: 9,
    created_at: '2024-01-01',
    response_count: 23,
  },
];

export default function FormsPage() {
  const [search, setSearch] = useState('');

  const filteredForms = mockForms.filter(form => 
    form.title.toLowerCase().includes(search.toLowerCase()) ||
    form.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 sm:py-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Available Forms
              </h1>
              <p className="text-muted-foreground mt-2">
                Browse and fill out available forms
              </p>
            </div>
            <Link href="/admin" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow h-full flex flex-col group">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(form.created_at)}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {form.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {form.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <span>{form.fields_count} fields</span>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{form.response_count} responses</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/${form.id}`} className="w-full">
                      <Button className="w-full group-hover:shadow-md transition-shadow">
                        Fill Out Form
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                {search ? 'No forms found' : 'No forms available'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {search 
                  ? `No forms match "${search}". Try a different search term.`
                  : 'There are currently no public forms available.'
                }
              </p>
              {search && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearch('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Powered by LOSL-C Forms Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
