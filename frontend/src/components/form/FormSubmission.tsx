import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormSubmissionProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  error: Error | null;
}

export const FormSubmission: React.FC<FormSubmissionProps> = ({
  onSubmit,
  isSubmitting,
  error
}) => {
  return (
    <>
      <div className="flex justify-end items-center gap-4 pt-8 mt-8 border-t border-border">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 px-8 text-base font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Response'
          )}
        </Button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive text-center">
            Failed to submit form. Please check your responses and try again.
          </p>
        </div>
      )}
    </>
  );
};
