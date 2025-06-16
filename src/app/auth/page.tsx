'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/authForm';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { colours } from '@/styles/colours';

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
          router.push('/profile'); // Redirect to profile page after successful login/signup
        }
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colours.background.secondary }}
    >
      <div className="max-w-md mx-auto pt-10 px-4">
        <AuthForm
          mode={mode}
          onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
        />
      </div>
    </div>
  );
}