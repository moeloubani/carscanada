'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Mail, Car } from 'lucide-react';
import { auth, user } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Verification token is missing. Please use the link from your email.');
        return;
      }

      try {
        await auth.verifyEmail(token);
        setVerificationStatus('success');
        
        // Start countdown for redirect
        const timer = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              // Redirect based on authentication status
              if (user) {
                router.push('/dashboard');
              } else {
                router.push('/login');
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error: any) {
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Unable to verify email. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token, router, user]);

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verifying Email</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Verification Complete</AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your account is now fully activated and ready to use.
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <p className="text-muted-foreground">
                Redirecting to {user ? 'dashboard' : 'login'} in {redirectCountdown} seconds...
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Link href={user ? '/dashboard' : '/login'} className="w-full">
              <Button className="w-full">
                Go to {user ? 'Dashboard' : 'Login'} now
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center">
            We couldn't verify your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          
          <Alert>
            <AlertTitle>What can you do?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Check if you're using the latest verification email</li>
                <li>Request a new verification email from your account settings</li>
                <li>Make sure the link wasn't modified or truncated</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {user ? (
            <>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    // TODO: Implement resendVerificationEmail endpoint
                    // await user.resendVerificationEmail();
                    console.log('Resend verification email - not yet implemented');
                    setErrorMessage('This feature is not yet available.');
                  } catch (error: any) {
                    setErrorMessage(error.message || 'Unable to resend verification email.');
                  }
                }}
              >
                Resend Verification Email
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="w-full">
                <Button className="w-full">Go to Login</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full">Create Account</Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}