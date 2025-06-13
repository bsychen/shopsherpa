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
 */
export function getAllergenTagClasses(): string {
  return "inline-block bg-red-100 border border-red-300 text-red-700 text-sm px-3 py-1.5 rounded-full font-semibold shadow-sm hover:bg-red-200 hover:text-red-900 transition";
}

/**
 * Get the CSS classes for removable allergen tags (profile page)
 */
export function getRemovableAllergenTagClasses(): string {
  return "inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm border border-red-200 transition-all duration-200 hover:bg-red-200";
}

/**
 * Format allergen display text with emoji
 */
export function formatAllergenDisplay(allergenInfo: AllergenInfo): string {
  return `${allergenInfo.emoji} ${allergenInfo.title}`;
}
