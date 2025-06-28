"use client"

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { createUserInFirestore } from '@/lib/api';
import ContentBox from '@/components/ContentBox';
import { colours } from '@/styles/colours';

export default function AuthForm({
  mode = 'login',
  onToggleMode,
}: {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set displayName to the entered username
        await updateProfile(userCredential.user, { displayName: username });
        await createUserInFirestore(userCredential.user.uid, email, username);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // router.push('/') has been moved to the auth state change listener
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err as Error).message);
    }
  };

  return (
    <ContentBox>
      <h1 
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: colours.text.primary }}
      >
        {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <div>
            <label 
              className="block text-sm font-medium mb-2" 
              htmlFor="username"
              style={{ color: colours.text.primary }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: colours.input.background,
                borderColor: colours.input.border,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: colours.input.text
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = colours.input.focus.ring;
                e.currentTarget.style.borderColor = colours.input.focus.border;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = colours.input.border;
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        )}
        
        <div>
          <label 
            className="block text-sm font-medium mb-2" 
            htmlFor="email"
            style={{ color: colours.text.primary }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: colours.input.background,
              borderColor: colours.input.border,
              borderWidth: '1px',
              borderStyle: 'solid',
              color: colours.input.text
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = colours.input.focus.ring;
              e.currentTarget.style.borderColor = colours.input.focus.border;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = colours.input.border;
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        
        <div>
          <label 
            className="block text-sm font-medium mb-2" 
            htmlFor="password"
            style={{ color: colours.text.primary }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: colours.input.background,
              borderColor: colours.input.border,
              borderWidth: '1px',
              borderStyle: 'solid',
              color: colours.input.text
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = colours.input.focus.ring;
              e.currentTarget.style.borderColor = colours.input.focus.border;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = colours.input.border;
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full rounded-xl shadow-xl font-semibold py-3 px-4 rounded-lg transition-all"
          style={{
            backgroundColor: colours.button.primary.background,
            border: `2px solid ${colours.button.primary.border}`,
            color: colours.button.primary.text
          }}
        >
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      
      <div 
        className="text-center text-sm mt-6"
        style={{ color: colours.text.secondary }}
      >
        {mode === 'signup' ? (
          <span>
            Already have an account?{' '}
            <button
              type="button"
              className="underline transition-colors"
              style={{ color: colours.text.link }}
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
              className="underline transition-colors"
              style={{ color: colours.text.link }}
              onClick={onToggleMode}
            >
              Sign Up
            </button>
          </span>
        )}
      </div>
    </ContentBox>
  );
}
