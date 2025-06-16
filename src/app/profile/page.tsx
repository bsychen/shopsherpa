"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { getUserById } from "@/lib/api";
import type { UserProfile } from "@/types/user";
import UserReviewsList from "@/components/UserReviewsList";
import PreferencesRadarChart from "@/components/PreferencesRadarChart";
import AllergenManager from "@/components/AllergenManager";
import ContentBox from "@/components/ContentBox";
import Image from "next/image";
import { colours } from "@/styles/colours";
import LoadingAnimation from "@/components/LoadingSpinner";
import { useTopBar } from "@/contexts/TopBarContext";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const router = useRouter();
  const { setNavigating } = useTopBar();

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
      .finally(() => {
        setLoading(false);
        setNavigating(false); // Clear navigation loading state
      });
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
      <LoadingAnimation />
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
    <div 
      className="max-w-2xl mx-auto p-6 space-y-2 opacity-0 animate-fade-in"
      style={{
        backgroundColor: colours.background.secondary
      }}
    >
      {/* User Profile Card */}
      <ContentBox className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
        <h1 
          className="text-2xl font-bold"
          style={{ color: colours.text.primary }}
        >
          {user.username || user.email || "Profile"}
        </h1>
        <div 
          className="text-xs mb-2"
          style={{ color: colours.text.muted }}
        >
          {user.email}
        </div>
        {user && user.userId && (
        <>
          {/* Shopping Preferences Section - Always Visible */}
          <div className="">
            <h2 
              className="text-lg font-semibold mb-4"
              style={{ color: colours.text.secondary }}
            >
              Shopping Preferences
            </h2>
            <PreferencesRadarChart 
              userProfile={user}
              onPreferencesUpdate={handlePreferencesUpdate}
              isUpdating={isUpdatingPreferences}
            />
          </div>
        </>
      )}
      </ContentBox>

      {/* Allergen Management Section - Separate Box */}
      {user && user.userId && (
        <ContentBox className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
          <AllergenManager 
            userProfile={user}
            onAllergensUpdate={handleAllergensUpdate}
            isUpdating={isUpdatingPreferences}
          />
        </ContentBox>
      )}

      {/* User Reviews Section */}
      {user && user.userId && (
        <ContentBox variant="secondary" className="transition-all mt-4 duration-300 opacity-0 animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
          <button
            className="w-full flex items-center justify-between text-lg font-semibold focus:outline-none"
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
        </ContentBox>
      )}

        <button
          onClick={handleLogout}
          className="rounded-xl shadow-xl text-white font-semibold py-2 px-4 rounded transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl opacity-0 animate-slide-in-bottom"
          style={{
            backgroundColor: colours.status.error.background,
            border: `2px solid ${colours.status.error.border}`,
            animationDelay: '400ms'
          }}
        >
          Log out
        </button>
        <div className="mt-4 text-xs text-grey-400 text-left opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
          User ID: {user.userId}
        </div>
      </div>
  );
}