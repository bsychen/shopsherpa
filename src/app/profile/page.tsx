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
import AllergenManager from "@/components/AllergenManager";
import Image from "next/image";
import { colours } from "@/styles/colours";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecents, setShowRecents] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
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

  const handleAllergensUpdate = async (allergens: string[]) => {
    if (!firebaseUser) return;

    setIsUpdatingPreferences(true); // Reuse the same loading state
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/updatePreferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ allergens }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update allergens');
      }

      // Update local user state with new allergens
      setUser(prevUser => prevUser ? { ...prevUser, allergens } : null);
    } catch (error) {
      console.error('Error updating allergens:', error);
      throw error; // Re-throw to let the component handle the error
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span style={{ color: colours.text.secondary }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-40">
        <span style={{ color: colours.status.error.text }}>User not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 space-y-6">
      {/* User Profile Card */}
      <div 
        className="rounded-xl shadow p-8"
        style={{
          backgroundColor: colours.card.background,
          border: `1px solid ${colours.card.border}`
        }}
      >
        <h1 
          className="text-2xl font-bold"
          style={{ color: colours.text.primary }}
        >
          {user.username || user.email || "Profile"}
        </h1>
        <div 
          className="text-xs mb-4"
          style={{ color: colours.text.muted }}
        >
          {user.email}
        </div>
        <div className="mb-2 flex justify-center">
          {user.pfp ? (
            <Image 
              src={user.pfp} 
              alt="Profile" 
              width={64} 
              height={64} 
              className="w-16 h-16 rounded-full"
              style={{ border: `1px solid ${colours.content.border}` }}
            />
          ) : (
            <span 
              className="italic"
              style={{ color: colours.text.muted }}
            >
              No profile picture
            </span>
          )}
        </div>

        {user && user.userId && (
        <>
          {/* Shopping Preferences Section - Always Visible */}
          <div className="mt-8">
            <h2 
              className="text-lg font-semibold mb-4"
              style={{ color: colours.text.secondary }}
            >
              Shopping Preferences
            </h2>
            <PreferencesBarGraph 
              userProfile={user}
              onPreferencesUpdate={handlePreferencesUpdate}
              isUpdating={isUpdatingPreferences}
            />
          </div>
        </>
      )}
      </div>

      {/* Allergen Management Section - Separate Box */}
      {user && user.userId && (
        <AllergenManager 
          userProfile={user}
          onAllergensUpdate={handleAllergensUpdate}
          isUpdating={isUpdatingPreferences}
        />
      )}

      {/* Dropdown Sections */}
      {user && user.userId && (
        <div className="space-y-4">
            {/* Recently Viewed Products Section */}
            <div 
              className="rounded-xl p-3 transition-all duration-300"
              style={{
                backgroundColor: colours.content.surfaceSecondary,
                border: `1px solid ${colours.content.border}`
              }}
            >
              <button
                className="w-full flex items-center justify-between text-lg font-semibold mb-2 focus:outline-none"
                style={{ color: colours.text.secondary }}
                onClick={() => setShowRecents((v) => !v)}
                aria-expanded={showRecents}
              >
                <span>Recently Viewed Products</span>
                <Image 
                  src="/down-arrow.svg" 
                  alt="Toggle arrow" 
                  width={16} 
                  height={16} 
                  className={`transform transition-transform duration-300 ease-in-out ${showRecents ? 'rotate-180' : ''}`}
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showRecents ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`transition-all duration-300 delay-150 ${
                  showRecents ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'
                }`}>
                  <div className={`${showRecents ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
                    <RecentlyViewedProducts userId={user.userId} />
                  </div>
                </div>
              </div>
            </div>

            {/* User Reviews Section */}
            <div 
              className="rounded-xl p-3 transition-all duration-300"
              style={{
                backgroundColor: colours.content.surfaceSecondary,
                border: `1px solid ${colours.content.border}`
              }}
            >
              <button
                className="w-full flex items-center justify-between text-lg font-semibold mb-2 focus:outline-none"
                style={{ color: colours.text.secondary }}
                onClick={() => setShowReviews((v) => !v)}
                aria-expanded={showReviews}
              >
                <span>Your Reviews</span>
                <Image 
                  src="/down-arrow.svg" 
                  alt="Toggle arrow" 
                  width={16} 
                  height={16} 
                  className={`transform transition-transform duration-300 ease-in-out ${showReviews ? 'rotate-180' : ''}`}
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showReviews ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`transition-all duration-300 delay-150 ${
                  showReviews ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'
                }`}>
                  <div className={`${showReviews ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
                    <UserReviewsList userId={user.userId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
  );
}