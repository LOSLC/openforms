'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser, useLogin, useRegister, useSendVerificationEmail } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showVerificationButton, setShowVerificationButton] = useState(false);
  const [lastLoginEmail, setLastLoginEmail] = useState('');
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const sendVerificationMutation = useSendVerificationEmail();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      password_confirm: '',
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      setShowVerificationButton(false);
      // Show success toast for OTP sent
      toast.success('OTP sent to your email! Please check your inbox.');
      
      // Small delay to let user see the toast before redirecting
      setTimeout(() => {
        router.push('/auth/login-otp');
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setLastLoginEmail(data.email);
      setShowVerificationButton(true);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(data)
      // Show success message and switch to login
      toast.success('Registration successful! Please check your email for verification.');
      setIsLogin(true);
      registerForm.reset();
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleSendVerification = async () => {
    if (!lastLoginEmail) return;
    
    try {
      await sendVerificationMutation.mutateAsync(lastLoginEmail);
      toast.success('Verification email sent! Please check your email.');
      setShowVerificationButton(false);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    }
  };

  // Show loading until we know the authentication state
  if (isLoading || (!isLoading && user && !isError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in your information to create an account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register('email')}
                  className={loginForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register('password')}
                  className={loginForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
              </Button>

              {showVerificationButton && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendVerification}
                    disabled={sendVerificationMutation.isPending}
                    className="text-xs"
                  >
                    {sendVerificationMutation.isPending 
                      ? 'Sending...' 
                      : 'Haven\'t verified your account? Send verification email'
                    }
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...registerForm.register('username')}
                  className={registerForm.formState.errors.username ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  {...registerForm.register('email')}
                  className={registerForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...registerForm.register('name')}
                  className={registerForm.formState.errors.name ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...registerForm.register('password')}
                  className={registerForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirm">Confirm Password</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  {...registerForm.register('password_confirm')}
                  className={registerForm.formState.errors.password_confirm ? 'border-red-500' : ''}
                />
                {registerForm.formState.errors.password_confirm && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.password_confirm.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowVerificationButton(false);
                setLastLoginEmail('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-500">
              ← Back to LOSL-C Forms
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
