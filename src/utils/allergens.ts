import { colours } from "@/styles/colours";

export interface AllergenInfo {
  title: string;
  emoji: string;
}

// Mapping of Open Food Facts allergen codes to display information
export const ALLERGEN_MAP: Record<string, AllergenInfo> = {
  'en:gluten': { title: 'Gluten', emoji: '🌾' },
  'en:peanuts': { title: 'Peanuts', emoji: '🥜' },
  'en:milk': { title: 'Milk', emoji: '🥛' },
  'en:soybeans': { title: 'Soy', emoji: '🌱' },
  'en:eggs': { title: 'Eggs', emoji: '🥚' },
  'en:tree-nuts': { title: 'Tree Nuts', emoji: '🌰' },
  'en:sesame-seeds': { title: 'Sesame', emoji: '⚪️' },
  'en:fish': { title: 'Fish', emoji: '🐟' },
  'en:crustaceans': { title: 'Crustaceans', emoji: '🦐' },
  'en:mustard': { title: 'Mustard', emoji: '🌭' },
  'en:celery': { title: 'Celery', emoji: '🥬' },
  'en:lupin': { title: 'Lupin', emoji: '🌸' },
  'en:molluscs': { title: 'Molluscs', emoji: '🦪' },
  'en:sulphur-dioxide-and-sulphites': { title: 'Sulphites', emoji: '🧪' },
};

// Mapping of user allergen database keys (lowercase with dashes) to display information
// This maps the database format to display information for the profile page
export const USER_ALLERGEN_MAP: Record<string, AllergenInfo> = {
  'milk': { title: 'Milk', emoji: '🥛' },
  'eggs': { title: 'Eggs', emoji: '🥚' },
  'fish': { title: 'Fish', emoji: '🐟' },
  'shellfish': { title: 'Shellfish', emoji: '🦐' },
  'tree-nuts': { title: 'Tree Nuts', emoji: '🌰' },
  'peanuts': { title: 'Peanuts', emoji: '🥜' },
  'wheat': { title: 'Wheat', emoji: '🌾' },
  'soybeans': { title: 'Soybeans', emoji: '🌱' },
  'sesame': { title: 'Sesame', emoji: '⚪️' },
  'celery': { title: 'Celery', emoji: '🥬' },
  'mustard': { title: 'Mustard', emoji: '🌭' },
  'lupin': { title: 'Lupin', emoji: '🌸' },
  'molluscs': { title: 'Molluscs', emoji: '🦪' },
  'sulphites': { title: 'Sulphites', emoji: '🧪' },
};

// Available allergens for the dropdown - maps display names to database keys
export const AVAILABLE_ALLERGENS = [
  { displayName: 'Milk', dbKey: 'milk' },
  { displayName: 'Eggs', dbKey: 'eggs' },
  { displayName: 'Fish', dbKey: 'fish' },
  { displayName: 'Shellfish', dbKey: 'shellfish' },
  { displayName: 'Tree Nuts', dbKey: 'tree-nuts' },
  { displayName: 'Peanuts', dbKey: 'peanuts' },
  { displayName: 'Wheat', dbKey: 'wheat' },
  { displayName: 'Soybeans', dbKey: 'soybeans' },
  { displayName: 'Sesame', dbKey: 'sesame' },
  { displayName: 'Celery', dbKey: 'celery' },
  { displayName: 'Mustard', dbKey: 'mustard' },
  { displayName: 'Lupin', dbKey: 'lupin' },
  { displayName: 'Molluscs', dbKey: 'molluscs' },
  { displayName: 'Sulphites', dbKey: 'sulphites' },
];

/**
 * Get allergen info from database key (lowercase with dashes for profile page)
 */
export function getAllergenInfo(allergenKey: string): AllergenInfo | null {
  return USER_ALLERGEN_MAP[allergenKey] || null;
}

/**
 * Get allergen info from Open Food Facts code (for product page)
 */
export function getAllergenInfoFromCode(allergenCode: string): AllergenInfo | null {
  const key = allergenCode.trim().toLowerCase();
  return ALLERGEN_MAP[key] || null;
}

/**
 * Get the CSS classes for allergen tags - consistent styling across the app
 * Uses the same color scheme as the allergen warning modal
 */
export function getAllergenTagClasses(): string {
  return "inline-block text-sm px-3 py-1.5 rounded-full font-medium shadow-lg transition-all duration-200";
}

/**
 * Get the inline styles for allergen tags using colours.status.error
 */
export function getAllergenTagStyles() {
  return {
    backgroundColor: `${colours.status.error.background}20`, // 20% opacity for lighter background
    borderColor: colours.status.error.border,
    borderWidth: '2px',
    borderStyle: 'solid',
    color: colours.status.error.border, // Use border color for text for better contrast
  };
}

/**
 * Get the hover styles for allergen tags
 */
export function getAllergenTagHoverStyles() {
  return {
    backgroundColor: `${colours.status.error.background}30`, // 30% opacity for hover
    color: colours.status.error.background,
  };
}

/**
 * Get the CSS classes for removable allergen tags (profile page)
 * Uses the same color scheme as the allergen warning modal
 */
export function getRemovableAllergenTagClasses(): string {
  return "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200";
}

/**
 * Get the inline styles for removable allergen tags using colours.status.error
 */
export function getRemovableAllergenTagStyles() {
  return {
    backgroundColor: `${colours.status.error.background}20`, // 20% opacity for lighter background
    borderColor: colours.status.error.border,
    borderWidth: '2px',
    borderStyle: 'solid',
    color: colours.status.error.border, // Use border color for text for better contrast
  };
}

/**
 * Format allergen display text with emoji
 */
export function formatAllergenDisplay(allergenInfo: AllergenInfo): string {
  return `${allergenInfo.emoji} ${allergenInfo.title}`;
}
