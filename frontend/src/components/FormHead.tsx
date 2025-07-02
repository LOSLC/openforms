'use client';

import { useEffect } from 'react';

interface FormHeadProps {
  form?: {
    id: string;
    label: string;
    description?: string | null;
    open: boolean;
  } | null;
  submitted?: boolean;
}

export function FormHead({ form, submitted }: FormHeadProps) {
  useEffect(() => {
    if (!form) return;

    // Update document title
    const title = submitted 
      ? `Thank you - ${form.label} - LOSL-C Forms`
      : `${form.label} - LOSL-C Forms`;
    document.title = title;
    
    // Update meta description
    const description = form.description 
      ? (submitted ? `Thank you for completing the ${form.label} form.` : form.description)
      : (submitted ? `Thank you for your submission.` : `Fill out the ${form.label} form. Powered by LOSL-C Forms.`);
    
    const updateOrCreateMeta = (selector: string, attribute: string, value: string, content: string) => {
      let meta = document.querySelector(selector);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, value);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Update basic meta tags
    updateOrCreateMeta('meta[name="description"]', 'name', 'description', description);

    // Update Open Graph meta tags
    updateOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', title);
    updateOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description);
    updateOrCreateMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    updateOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
    
    // Update Twitter Card meta tags
    updateOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    updateOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    updateOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    // Add structured data for the form
    if (!submitted) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": form.label,
        "description": description,
        "url": window.location.href,
        "isPartOf": {
          "@type": "WebSite",
          "name": "LOSL-C Forms",
          "url": window.location.origin
        },
        "about": {
          "@type": "Survey",
          "name": form.label,
          "description": form.description || `${form.label} form`
        }
      };

      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-form-id]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-form-id', form.id);
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [form, submitted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.title = 'LOSL-C Forms';
      
      // Remove structured data
      const structuredDataScript = document.querySelector('script[type="application/ld+json"][data-form-id]');
      if (structuredDataScript) {
        structuredDataScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
