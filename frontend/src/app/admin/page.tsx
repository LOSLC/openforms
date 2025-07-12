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
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:h-16 gap-3">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                LOSL-C Forms Admin
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground truncate">
                Welcome, {user.name || user.username}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full sm:w-auto"
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
          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/forms/new" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Plus className="text-primary h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base text-foreground">Create New Form</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Build a new form from scratch</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/forms" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FileText className="text-green-600 dark:text-green-500 h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base text-foreground">Manage Forms</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Edit and organize your forms</p>
                  </div>
                </CardContent>
              </Card>
            </Link>


          </div>
        </div>

        {/* Recent Forms */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg font-medium text-foreground">Your Forms</h2>
            <Link href="/admin/forms">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

          {formsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.slice(0, 6).map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-base leading-tight">{form.label}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {form.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileX className="text-muted-foreground h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No forms yet</h3>
                <p className="text-muted-foreground mb-4">
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
