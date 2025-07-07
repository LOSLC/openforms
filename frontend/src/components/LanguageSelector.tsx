'use client';

import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SupportedLanguages } from '../lib/api';

interface LanguageSelectorProps {
  onTranslate: (language: SupportedLanguages) => void;
  isTranslating?: boolean;
  disabled?: boolean;
}

const supportedLanguages: { value: SupportedLanguages; label: string; flag: string }[] = [
  { value: 'English', label: 'English', flag: '🇺🇸' },
  { value: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { value: 'French', label: 'Français', flag: '🇫🇷' },
  { value: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'Chinese', label: '中文', flag: '🇨🇳' },
  { value: 'Japanese', label: '日本語', flag: '🇯🇵' },
];

export function LanguageSelector({ onTranslate, isTranslating = false, disabled = false }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages | ''>('');

  const handleTranslate = () => {
    if (selectedLanguage !== '') {
      onTranslate(selectedLanguage as SupportedLanguages);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Languages className="h-4 w-4 text-blue-600" />
      <span className="text-sm text-blue-700 font-medium">
        Need this form in your language?
      </span>
      <Select 
        value={selectedLanguage} 
        onValueChange={(value) => setSelectedLanguage(value as SupportedLanguages)}
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
      <Button
        size="sm"
        onClick={handleTranslate}
        disabled={selectedLanguage === '' || isTranslating || disabled}
        className="h-8"
      >
        {isTranslating ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Translating...
          </>
        ) : (
          'Translate'
        )}
      </Button>
    </div>
  );
}
