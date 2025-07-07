'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyLoginOtp } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const verifyMutation = useVerifyLoginOtp();

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const submitOtp = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (isBlocked) {
      setError('Too many attempts. Please login again.');
      return;
    }

    setError(''); // Clear any previous errors
    
    try {
      await verifyMutation.mutateAsync(otpCode);
      toast.success('Login verified successfully!');
      setIsVerified(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error) {
      console.error('OTP verification failed:', error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        setError('Too many failed attempts. Please login again.');
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      } else {
        setError(`Invalid code. ${3 - newAttempts} attempts remaining.`);
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Prevent input if blocked
    if (isBlocked) return;
    
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    // Clear error when user starts typing
    if (error) setError('');

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        submitOtp(otpCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Prevent paste if blocked
    if (isBlocked) return;
    
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length <= 6) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      
      // Auto-submit if we have a complete 6-digit code
      if (digits.length === 6) {
        submitOtp(digits);
      } else {
        // Focus on the next empty input or the last input
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
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
            Enter Verification Code
          </CardTitle>
          <CardDescription className="text-center">
            We sent a 6-digit code to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 ${
                    error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  autoComplete="one-time-code"
                  disabled={verifyMutation.isPending || isBlocked}
                />
              ))}
            </div>

            {error && (
              <div className="text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {verifyMutation.isPending && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Verifying...</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Login again
              </button>
            </p>
            <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-500 block">
              ← Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
