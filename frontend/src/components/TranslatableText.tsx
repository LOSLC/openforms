'use client';

import { useState, useRef, useEffect } from 'react';
import { SupportedLanguages } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TranslatableTextProps {
  children: React.ReactNode;
  text: string;
  onTranslate: (text: string, language: SupportedLanguages) => Promise<string>;
  language: SupportedLanguages | null;
  isEnabled: boolean;
  className?: string;
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  text,
  onTranslate,
  language,
  isEnabled,
  className = '',
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset translation when language changes or when translation is disabled
  useEffect(() => {
    setTranslatedText(null);
    setShowTranslation(false);
    setIsTranslating(false);
    setIsTouched(false);
  }, [language, isEnabled]);

  const handleMouseEnter = () => {
    if (!isEnabled || !language) return;
    
    setIsHovering(true);
    startTranslation();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    hideTranslation();
  };

  const handleTouchStart = () => {
    if (!isEnabled || !language) return;
    
    setIsTouched(true);
    startTranslation();
  };

  const handleTouchEnd = () => {
    // On mobile, show translation for 3 seconds after touch
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouched(false);
      hideTranslation();
    }, 3000);
  };

  const startTranslation = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Start translation after 300ms delay (shorter for touch)
    const delay = isTouched ? 100 : 300;
    timeoutRef.current = setTimeout(async () => {
      if (!translatedText && text.trim() && language) {
        setIsTranslating(true);
        try {
          const translated = await onTranslate(text, language);
          setTranslatedText(translated);
          
          // Show translation after a brief delay to ensure smooth transition
          translationTimeoutRef.current = setTimeout(() => {
            setShowTranslation(true);
            setIsTranslating(false);
          }, 100);
        } catch (error) {
          console.error('Translation failed:', error);
          setIsTranslating(false);
        }
      } else if (translatedText) {
        setShowTranslation(true);
      }
    }, delay);
  };

  const hideTranslation = () => {
    if (!isTouched) {
      setShowTranslation(false);
    }
    
    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const displayText = showTranslation && translatedText ? translatedText : children;

  return (
    <span
      className={`block w-full ${className} ${
        isEnabled && language ? 'transition-colors duration-200' : ''
      } ${(isHovering || isTouched) && isEnabled && language ? 'bg-blue-50 border-b border-blue-300' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isTranslating ? (
        <span className="inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {children}
        </span>
      ) : (
        displayText
      )}
    </span>
  );
};
