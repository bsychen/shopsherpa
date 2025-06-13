"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { getUserById } from "@/lib/api";
import type { UserProfile } from "@/types/user";
import UserReviewsList from "@/components/UserReviewsList";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import PreferencesBarGraph from "@/components/PreferencesBarGraph";
import Image from "next/image";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecents, setShowRecents] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
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
          userId: typeof userData?.userId === "string" ? userData.userId : firebaseUser.uid,
          username: typeof userData?.username === "string" ? userData.username : '',
          email: typeof userData?.email === "string" ? userData.email : firebaseUser.email || '',
          pfp: typeof userData?.pfp === "string" ? userData.pfp : '',
          // Include preference fields with defaults
          pricePreference: typeof userData?.pricePreference === "number" ? userData.pricePreference : 1,
          qualityPreference: typeof userData?.qualityPreference === "number" ? userData.qualityPreference : 1,
          nutritionPreference: typeof userData?.nutritionPreference === "number" ? userData.nutritionPreference : 1,
          sustainabilityPreference: typeof userData?.sustainabilityPreference === "number" ? userData.sustainabilityPreference : 1,
          brandPreference: typeof userData?.brandPreference === "number" ? userData.brandPreference : 1,
          allergens: Array.isArray(userData?.allergens) ? userData.allergens : [],
        });
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const handlePreferencesUpdate = async (preferences: Partial<UserProfile>) => {
    if (!firebaseUser) return;

    setIsUpdatingPreferences(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/updatePreferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update preferences');
      }

      // Update local user state with new preferences
      setUser(prevUser => prevUser ? { ...prevUser, ...preferences } : null);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error; // Re-throw to let the component handle the error
    } finally {
      setIsUpdatingPreferences(false);
    }
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
    <div className="max-w-4xl mx-auto mt-10 p-6 space-y-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{user.username || user.email || "Profile"}</h1>
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="ml-2 text-gray-900">{user.email}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Profile Picture:</span>
          <span className="ml-2 text-gray-900">
            {user.pfp ? (
              <Image src={user.pfp} alt="Profile" width={64} height={64} className="inline-block w-16 h-16 rounded-full border border-zinc-300" />
            ) : (
              <span className="italic text-gray-400">No profile picture</span>
            )}
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          Log out
        </button>
        <div className="mt-4 text-xs text-gray-400 text-left">
          User ID: {user.userId}
        </div>
      </div>

      {user && user.userId && (
        <>
          {/* Shopping Preferences Section */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
            <button
              className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 mb-2 focus:outline-none"
              onClick={() => setShowPreferences((v) => !v)}
              aria-expanded={showPreferences}
            >
              <span>Shopping Preferences</span>
              <span className={`transform transition-transform ${showPreferences ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {showPreferences && (
              <PreferencesBarGraph 
                userProfile={user}
                onPreferencesUpdate={handlePreferencesUpdate}
                isUpdating={isUpdatingPreferences}
              />
            )}
          </div>

          {/* Recently Viewed Products Section */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
            <button
              className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 mb-2 focus:outline-none"
              onClick={() => setShowRecents((v) => !v)}
              aria-expanded={showRecents}
            >
              <span>Recently Viewed Products</span>
              <span className={`transform transition-transform ${showRecents ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {showRecents && (
              <RecentlyViewedProducts userId={user.userId} />
            )}
          </div>

          {/* User Reviews Section */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
            <button
              className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 mb-2 focus:outline-none"
              onClick={() => setShowReviews((v) => !v)}
              aria-expanded={showReviews}
            >
              <span>Your Reviews</span>
              <span className={`transform transition-transform ${showReviews ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {showReviews && (
              <UserReviewsList userId={user.userId} />
            )}
          </div>
        </>
      )}
    </div>
  );
}