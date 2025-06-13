export type UserProfile = {
    userId: string;
    email: string;
    username: string;
    pfp: string; // profile picture URL
    pricePreference?: number;
    qualityPreference?: number;
    nutritionPreference?: number;
    sustainabilityPreference?: number;
    brandPreference?: number;
    allergens?: string[];
};
