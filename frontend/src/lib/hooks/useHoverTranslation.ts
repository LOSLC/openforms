import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { translationService } from '../services/translation';
import { SupportedLanguages } from '../api';

export interface TranslationCache {
  [key: string]: {
    [language: string]: string;
  };
}

export interface UseHoverTranslationReturn {
  translateText: (text: string, language: SupportedLanguages) => Promise<string>;
  isTranslating: boolean;
  translationCache: TranslationCache;
  clearCache: () => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export const useHoverTranslation = (): UseHoverTranslationReturn => {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [isEnabled, setIsEnabled] = useState(false);

  const translateMutation = useMutation({
    mutationFn: ({ text, language }: { text: string; language: SupportedLanguages }) =>
      translationService.translateText(text, language),
  });

  const translateText = useCallback(
    async (text: string, language: SupportedLanguages): Promise<string> => {
      if (!isEnabled) return text;
      
      const cacheKey = text.trim();
      const cachedTranslation = translationCache[cacheKey]?.[language];
      
      if (cachedTranslation) {
        return cachedTranslation;
      }

      try {
        const translatedText = await translateMutation.mutateAsync({ text, language });
        
        // Update cache
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...prev[cacheKey],
            [language]: translatedText,
          },
        }));
        
        return translatedText;
      } catch (error) {
        console.error('Translation failed:', error);
        return text; // Return original text on failure
      }
    },
    [isEnabled, translationCache, translateMutation]
  );

  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);

  return {
    translateText,
    isTranslating: translateMutation.isPending,
    translationCache,
    clearCache,
    isEnabled,
    setIsEnabled,
  };
};
