import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Form - LOSL-C Forms',
  description: 'Fill out this form powered by LOSL-C Forms.',
  openGraph: {
    title: 'Form - LOSL-C Forms',
    description: 'Fill out this form powered by LOSL-C Forms.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Form - LOSL-C Forms',
    description: 'Fill out this form powered by LOSL-C Forms.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface FormLayoutProps {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
}

export default function FormLayout({ children }: FormLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
