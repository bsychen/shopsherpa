"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { UserCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";

export default function TopBar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-4 py-3 mb-6">
      <Link
        href="/"
        className="text-xl font-bold text-blue-600 tracking-tight select-none hover:underline"
        title="Home"
      >
        ShopSmart
      </Link>
      <div className="flex items-center gap-6">
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : user ? (
          <Link
            href="/profile"
            className="text-blue-700 hover:text-blue-900 transition flex items-center gap-1 font-medium"
            title="Profile"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="sr-only">Profile</span>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="text-blue-700 hover:text-blue-900 transition flex items-center gap-1 font-medium"
            title="Login"
          >
            <ArrowRightCircleIcon className="h-6 w-6" />
            <span className="sr-only">Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}