'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/authForm';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirect = localStorage.getItem('postAuthRedirect');
        console.log('User is authenticated:', user);
        console.log('Redirecting to:', redirect);
        if (redirect) {
          localStorage.removeItem('postAuthRedirect');
          router.push(redirect);
        } else {
          router.push('/'); // Redirect to home if no postAuthRedirect is set
        }
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <AuthForm
      mode={mode}
      onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
    />
  );
}