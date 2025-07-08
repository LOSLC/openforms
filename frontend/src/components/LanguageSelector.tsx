'use client';

import { useState } from 'react';
import { Languages, Loader2, MousePointer, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { SupportedLanguages } from '../lib/api';

type TranslationMethod = 'hover' | 'full';

interface LanguageSelectorProps {
  onTranslate: (language: SupportedLanguages) => void;
  isTranslating?: boolean;
  disabled?: boolean;
  onHoverTranslationToggle?: (enabled: boolean, language: SupportedLanguages | null) => void;
  onTranslationMethodChange?: (method: TranslationMethod) => void;
  hoverTranslationEnabled?: boolean;
  translationMethod?: TranslationMethod;
}

const supportedLanguages: { value: SupportedLanguages; label: string; flag: string }[] = [
  { value: 'English', label: 'English', flag: '🇺🇸' },
  { value: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { value: 'French', label: 'Français', flag: '🇫🇷' },
  { value: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'Chinese', label: '中文', flag: '🇨🇳' },
  { value: 'Japanese', label: '日本語', flag: '🇯🇵' },
];

export function LanguageSelector({ 
  onTranslate, 
  isTranslating = false, 
  disabled = false,
  onHoverTranslationToggle,
  onTranslationMethodChange,
  hoverTranslationEnabled = false,
  translationMethod = 'hover'
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages | ''>('');

  const handleTranslate = () => {
    if (selectedLanguage !== '') {
      onTranslate(selectedLanguage as SupportedLanguages);
    }
  };

  const handleHoverToggle = (checked: boolean) => {
    const language = selectedLanguage !== '' ? (selectedLanguage as SupportedLanguages) : null;
    onHoverTranslationToggle?.(checked, language);
  };

  const handleMethodChange = (method: TranslationMethod) => {
    onTranslationMethodChange?.(method);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as SupportedLanguages);
    // If hover translation is enabled, notify about language change
    if (hoverTranslationEnabled && value !== '') {
      onHoverTranslationToggle?.(true, value as SupportedLanguages);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          Need this form in your language?
        </span>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        <Select 
          value={selectedLanguage} 
          onValueChange={handleLanguageChange}
          disabled={disabled || isTranslating}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedLanguage && (
          <>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hover-translation"
                checked={hoverTranslationEnabled}
                onCheckedChange={handleHoverToggle}
                disabled={disabled || isTranslating}
              />
              <Label htmlFor="hover-translation" className="text-xs text-blue-700">
                Hover to translate
              </Label>
            </div>

            {hoverTranslationEnabled && (
              <Select
                value={translationMethod}
                onValueChange={(value) => handleMethodChange(value as TranslationMethod)}
                disabled={disabled || isTranslating}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hover">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-3 w-3" />
                      <span>Hover</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>Full form</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              size="sm"
              onClick={handleTranslate}
              disabled={!selectedLanguage || isTranslating || disabled}
              className="h-8"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate Form'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
