"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { UserCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { colours } from "@/styles/colours";

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
    <header className="w-full shadow flex items-center justify-between px-4 py-3 mb-6" style={{ backgroundColor: colours.card.background }}>
      <Link
        href="/"
        className="text-xl font-bold tracking-tight select-none hover:underline"
        style={{ color: colours.text.link }}
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
            className="transition flex items-center gap-1 font-medium hover:underline"
            style={{ color: colours.text.link }}
            title="Profile"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="sr-only">Profile</span>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="transition flex items-center gap-1 font-medium hover:underline"
            style={{ color: colours.text.link }}
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