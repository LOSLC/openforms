import React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { SupportedLanguages } from '@/lib/api';

interface TranslationControlsProps {
  isTranslated: boolean;
  isTranslating: boolean;
  translationError: Error | null;
  disabled: boolean;
  hoverTranslationEnabled: boolean;
  translationMethod: 'hover' | 'full';
  onTranslate: (language: SupportedLanguages) => void;
  onResetTranslation: () => void;
  onHoverTranslationToggle: (enabled: boolean, language: SupportedLanguages | null) => void;
  onTranslationMethodChange: (method: 'hover' | 'full') => void;
}

export const TranslationControls: React.FC<TranslationControlsProps> = ({
  isTranslated,
  isTranslating,
  translationError,
  disabled,
  hoverTranslationEnabled,
  translationMethod,
  onTranslate,
  onResetTranslation,
  onHoverTranslationToggle,
  onTranslationMethodChange
}) => {
  return (
    <div className="mb-6">
      {isTranslated ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400 font-medium flex-1">
            Form has been translated
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetTranslation}
            className="h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Show Original
          </Button>
        </div>
      ) : (
        <LanguageSelector
          onTranslate={onTranslate}
          isTranslating={isTranslating}
          disabled={disabled}
          onHoverTranslationToggle={onHoverTranslationToggle}
          onTranslationMethodChange={onTranslationMethodChange}
          hoverTranslationEnabled={hoverTranslationEnabled}
          translationMethod={translationMethod}
        />
      )}
      {translationError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Translation failed. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
};
