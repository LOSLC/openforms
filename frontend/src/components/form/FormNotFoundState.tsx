import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

export const FormNotFoundState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Form not found</h3>
          <p className="text-muted-foreground mb-6">
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
};
