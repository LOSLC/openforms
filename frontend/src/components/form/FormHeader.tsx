import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FormHeaderProps {
  title?: string;
  description?: string;
  wrapWithTranslation: (text: string, children: React.ReactNode, className?: string) => React.ReactNode;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  description,
  wrapWithTranslation
}) => {
  return (
    <CardHeader className="text-center pb-6 pt-6 sm:pb-8 sm:pt-8 lg:pt-12 px-4 sm:px-6 lg:px-8">
      {title && (
        <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 leading-tight">
          {wrapWithTranslation(title, title)}
        </CardTitle>
      )}
      {description && (
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {wrapWithTranslation(description, description)}
        </CardDescription>
      )}
    </CardHeader>
  );
};
