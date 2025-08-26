import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export const FormSuccessState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-16">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 dark:text-green-500 h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">Thank you!</h3>
          <p className="text-muted-foreground leading-relaxed">
            Your response has been submitted successfully. We appreciate your participation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
