'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetUserForms } from '@/lib/hooks/useForms';
import Link from 'next/link';
import { BarChart3, FileX } from 'lucide-react';

export default function FormsPage() {
  const [search, setSearch] = useState('');
  const { data: forms, isLoading } = useGetUserForms();

  const filteredForms = forms?.filter(form => 
    form.label.toLowerCase().includes(search.toLowerCase()) ||
    form.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:h-16 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="font-medium">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Manage Forms
              </h1>
            </div>
            <Link href="/admin/forms/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                + Create New Form
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md"
          />
        </div>

        {/* Forms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate text-base pr-2">{form.label}</span>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {form.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{form.fields_length} fields</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <Link href={`/admin/forms/${form.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/${form.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        Preview
                      </Button>
                    </Link>
                    <Link href={`/admin/forms/${form.id}/responses`} className="sm:w-auto">
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                        <BarChart3 className="h-4 w-4 sm:mx-0 mr-2" />
                        <span className="sm:hidden">Responses</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileX className="text-gray-400 h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search ? 'No forms found' : 'No forms yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {search 
                  ? `No forms match "${search}". Try a different search term.`
                  : 'Get started by creating your first form.'
                }
              </p>
              {!search && (
                <Link href="/admin/forms/new" className="inline-block">
                  <Button className="w-full sm:w-auto">
                    + Create Your First Form
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
