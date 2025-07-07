'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyLogin } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const otpSchema = z.object({
  token: z.string().min(1, 'OTP code is required'),
});

type OtpForm = z.infer<typeof otpSchema>;

function OtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerified, setIsVerified] = useState(false);
  
  const verifyMutation = useVerifyLogin();

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      token: '',
    },
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/auth');
    }
  }, [sessionId, router]);

  const onSubmit = async (data: OtpForm) => {
    if (!sessionId) return;
    
    try {
      await verifyMutation.mutateAsync({
        token: data.token,
        session_id: sessionId,
      });
      toast.success('Login verified successfully!');
      setIsVerified(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error) {
      console.error('OTP verification failed:', error);
      toast.error('Invalid OTP code. Please try again.');
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Login Verified!
            </CardTitle>
            <CardDescription>
              Successfully logged in. Redirecting to admin panel...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Enter OTP Code
          </CardTitle>
          <CardDescription className="text-center">
            Please enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">OTP Code</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...form.register('token')}
                className={form.formState.errors.token ? 'border-red-500' : ''}
              />
              {form.formState.errors.token && (
                <p className="text-sm text-red-500">{form.formState.errors.token.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OtpPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<OtpPageSkeleton />}>
      <OtpPageContent />
    </Suspense>
  );
}
