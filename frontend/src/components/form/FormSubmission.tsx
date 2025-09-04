import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface FormSubmissionProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  error: Error | null;
  onSave?: () => void;
  isSaving?: boolean;
}

export const FormSubmission: React.FC<FormSubmissionProps> = ({
  onSubmit,
  isSubmitting,
  error,
  onSave,
  isSaving
}) => {
  return (
    <>
  <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 sm:gap-4 pt-8 mt-8 border-t border-border">
        {onSave && (
          <Button
            type="button"
            variant="outline"
            onClick={onSave}
            disabled={isSaving || isSubmitting}
    className="w-full sm:w-auto h-11 px-6 text-base"
            title="Save your progress. Your answers will be restored next time you open this form."
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save progress
              </>
            )}
          </Button>
        )}
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
