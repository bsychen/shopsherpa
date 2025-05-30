"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function AuthForm({
  mode = 'login',
  onToggleMode,
}: {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err as Error).message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
      </h2>
      <div>
        <label className="block text-gray-700 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@email.com"
          className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 transition text-white font-semibold p-2 w-full rounded-md shadow"
        type="submit"
      >
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </button>
      <div className="text-center text-gray-600">
        {mode === 'signup' ? (
          <span>
            Already have an account?{' '}
            <button
              type="button"
              className="underline text-blue-600 hover:text-blue-800"
              onClick={onToggleMode}
            >
              Log In
            </button>
          </span>
        ) : (
          <span>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="underline text-blue-600 hover:text-blue-800"
              onClick={onToggleMode}
            >
              Sign Up
            </button>
          </span>
        )}
      </div>
    </form>
  );
}
