'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser, useLogout } from '@/lib/hooks/useAuth';
import { useGetUserForms } from '@/lib/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, FileX, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: forms, isLoading: formsLoading } = useGetUserForms();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                LOSL-C Forms Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name || user.username}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/forms/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Plus className="text-blue-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create New Form</h3>
                    <p className="text-sm text-gray-600">Build a new form from scratch</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/forms">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <FileText className="text-green-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Forms</h3>
                    <p className="text-sm text-gray-600">Edit and organize your forms</p>
                  </div>
                </CardContent>
              </Card>
            </Link>


          </div>
        </div>

        {/* Recent Forms */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Forms</h2>
            <Link href="/admin/forms">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {formsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.slice(0, 6).map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{form.label}</CardTitle>
                    <CardDescription>
                      {form.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{form.fields_length} fields</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/admin/forms/${form.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/${form.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full">
                          View
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first form
                </p>
                <Link href="/admin/forms/new">
                  <Button>
                    + Create Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
