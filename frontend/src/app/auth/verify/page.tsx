"use client"
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyAccount } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

type VerifyForm = z.infer<typeof verifySchema>;

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('token'); // The session ID comes as 'token' in the URL
  const [isVerified, setIsVerified] = useState(false);
  
  const verifyMutation = useVerifyAccount();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: '',
    },
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/auth');
    }
  }, [sessionId, router]);

  const onSubmit = async (data: VerifyForm) => {
    if (!sessionId) return;
    
    try {
      await verifyMutation.mutateAsync({
        token: data.token,
        session_id: sessionId,
      });
      toast.success('Account verified successfully!');
      setIsVerified(true);
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed. Please check your code and try again.');
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Account Verified!
            </CardTitle>
            <CardDescription>
              Your account has been successfully verified. Redirecting to login...
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
            Verify Your Account
          </CardTitle>
          <CardDescription className="text-center">
            Please enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter verification code"
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
              {verifyMutation.isPending ? 'Verifying...' : 'Verify Account'}
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

function VerifyPageSkeleton() {
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageSkeleton />}>
      <VerifyPageContent />
    </Suspense>
  );
}
