import React from 'react';
import { Loader2 } from 'lucide-react';

export const FormLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading form...</p>
      </div>
    </div>
  );
};
