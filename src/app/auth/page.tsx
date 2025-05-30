'use client';

import { useState } from 'react';
import AuthForm from '@/components/authForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  return (
    <AuthForm
      mode={mode}
      onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
    />
  );
}