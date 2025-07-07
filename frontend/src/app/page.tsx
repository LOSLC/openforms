'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/lib/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  // Show loading until we know the authentication state
  if (isLoading || (!isLoading && user && !isError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">LOSL-C Forms</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Dynamic form management system for LOSL-C
          </p>
          <Link href="/auth">
            <Button className="w-full">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
