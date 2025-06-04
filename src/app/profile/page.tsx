"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { getUserById } from "@/lib/api";
import type { UserProfile } from "@/types/user";
import UserReviewsList from "@/components/UserReviewsList";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (!firebaseUser) {
        router.push("/auth");
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    setLoading(true);
    getUserById(firebaseUser.uid)
      .then((userData) => {
        // Defensive: ensure all required fields are present
        setUser({
          userId: userData?.userId || firebaseUser.uid,
          username: userData?.username || '',
          email: userData?.email || firebaseUser.email || '',
          pfp: userData?.pfp || '',
        });
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-red-500">User not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-8 flex flex-col min-h-[400px]">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{user.username || user.email || "Profile"}</h1>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Email:</span>
        <span className="ml-2 text-gray-900">{user.email}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Profile Picture:</span>
        <span className="ml-2 text-gray-900">
          {user.pfp ? (
            <img src={user.pfp} alt="Profile" className="inline-block w-16 h-16 rounded-full border border-zinc-300" />
          ) : (
            <span className="italic text-gray-400">No profile picture</span>
          )}
        </span>
      </div>
      {user && user.userId && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Your Reviews</h2>
          {/* UserReviewsList will fetch and display the user's reviews */}
          <UserReviewsList userId={user.userId} />
        </div>
      )}
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
      >
        Log out
      </button>
      <div className="mt-auto pt-6 text-xs text-gray-400 text-left">
        User ID: {user.userId}
      </div>
    </div>
  );
}