import { colours } from "@/styles/colours";

export interface CountryInfo {
  title: string;
  emoji: string;
}

/* Country mapping: maps Open Food Facts country codes to display name and flag emoji */
export const COUNTRY_MAP: Record<string, CountryInfo> = {
  'en:france': { title: 'France', emoji: '🇫🇷' },
  'en:united-states': { title: 'United States', emoji: '🇺🇸' },
  'en:germany': { title: 'Germany', emoji: '🇩🇪' },
  'en:united-kingdom': { title: 'United Kingdom', emoji: '🇬🇧' },
  'en:italy': { title: 'Italy', emoji: '🇮🇹' },
  'en:spain': { title: 'Spain', emoji: '🇪🇸' },
  'en:canada': { title: 'Canada', emoji: '🇨🇦' },
  'en:australia': { title: 'Australia', emoji: '🇦🇺' },
  'en:japan': { title: 'Japan', emoji: '🇯🇵' },
  'en:china': { title: 'China', emoji: '🇨🇳' },
  'en:india': { title: 'India', emoji: '🇮🇳' },
  'en:brazil': { title: 'Brazil', emoji: '🇧🇷' },
  'en:mexico': { title: 'Mexico', emoji: '🇲🇽' },
  'en:argentina': { title: 'Argentina', emoji: '🇦🇷' },
  'en:chile': { title: 'Chile', emoji: '🇨🇱' },
  'en:netherlands': { title: 'Netherlands', emoji: '🇳🇱' },
  'en:belgium': { title: 'Belgium', emoji: '🇧🇪' },
  'en:switzerland': { title: 'Switzerland', emoji: '🇨🇭' },
  'en:austria': { title: 'Austria', emoji: '🇦🇹' },
  'en:sweden': { title: 'Sweden', emoji: '🇸🇪' },
  'en:norway': { title: 'Norway', emoji: '🇳🇴' },
  'en:denmark': { title: 'Denmark', emoji: '🇩🇰' },
  'en:finland': { title: 'Finland', emoji: '🇫🇮' },
  'en:poland': { title: 'Poland', emoji: '🇵🇱' },
  'en:czech-republic': { title: 'Czech Republic', emoji: '🇨🇿' },
  'en:hungary': { title: 'Hungary', emoji: '🇭🇺' },
  'en:greece': { title: 'Greece', emoji: '🇬🇷' },
  'en:portugal': { title: 'Portugal', emoji: '🇵🇹' },
  'en:turkey': { title: 'Turkey', emoji: '🇹🇷' },
  'en:russia': { title: 'Russia', emoji: '🇷🇺' },
  'en:south-korea': { title: 'South Korea', emoji: '🇰🇷' },
  'en:thailand': { title: 'Thailand', emoji: '🇹🇭' },
  'en:vietnam': { title: 'Vietnam', emoji: '🇻🇳' },
  'en:philippines': { title: 'Philippines', emoji: '🇵🇭' },
  'en:indonesia': { title: 'Indonesia', emoji: '🇮🇩' },
  'en:malaysia': { title: 'Malaysia', emoji: '🇲🇾' },
  'en:singapore': { title: 'Singapore', emoji: '🇸🇬' },
  'en:new-zealand': { title: 'New Zealand', emoji: '🇳🇿' },
  'en:south-africa': { title: 'South Africa', emoji: '🇿🇦' },
  'en:egypt': { title: 'Egypt', emoji: '🇪🇬' },
  'en:morocco': { title: 'Morocco', emoji: '🇲🇦' },
  'en:tunisia': { title: 'Tunisia', emoji: '🇹🇳' },
  'en:algeria': { title: 'Algeria', emoji: '🇩🇿' },
  'en:israel': { title: 'Israel', emoji: '🇮🇱' },
  'en:lebanon': { title: 'Lebanon', emoji: '🇱🇧' },
  'en:jordan': { title: 'Jordan', emoji: '🇯🇴' },
  'en:saudi-arabia': { title: 'Saudi Arabia', emoji: '🇸🇦' },
  'en:united-arab-emirates': { title: 'UAE', emoji: '🇦🇪' },
  'en:pakistan': { title: 'Pakistan', emoji: '🇵🇰' },
  'en:bangladesh': { title: 'Bangladesh', emoji: '🇧🇩' },
  'en:sri-lanka': { title: 'Sri Lanka', emoji: '🇱🇰' },
  'en:nepal': { title: 'Nepal', emoji: '🇳🇵' },
  'en:ireland': { title: 'Ireland', emoji: '🇮🇪' },
  'en:iceland': { title: 'Iceland', emoji: '🇮🇸' },
  'en:luxembourg': { title: 'Luxembourg', emoji: '🇱🇺' },
  'en:slovenia': { title: 'Slovenia', emoji: '🇸🇮' },
  'en:croatia': { title: 'Croatia', emoji: '🇭🇷' },
  'en:serbia': { title: 'Serbia', emoji: '🇷🇸' },
  'en:bosnia-and-herzegovina': { title: 'Bosnia and Herzegovina', emoji: '🇧🇦' },
  'en:montenegro': { title: 'Montenegro', emoji: '🇲🇪' },
  'en:albania': { title: 'Albania', emoji: '🇦🇱' },
  'en:macedonia': { title: 'North Macedonia', emoji: '🇲🇰' },
  'en:bulgaria': { title: 'Bulgaria', emoji: '🇧🇬' },
  'en:romania': { title: 'Romania', emoji: '🇷🇴' },
  'en:ukraine': { title: 'Ukraine', emoji: '🇺🇦' },
  'en:belarus': { title: 'Belarus', emoji: '🇧🇾' },
  'en:lithuania': { title: 'Lithuania', emoji: '🇱🇹' },
  'en:latvia': { title: 'Latvia', emoji: '🇱🇻' },
  'en:estonia': { title: 'Estonia', emoji: '🇪🇪' },
  'en:moldova': { title: 'Moldova', emoji: '🇲🇩' },
  'en:georgia': { title: 'Georgia', emoji: '🇬🇪' },
  'en:armenia': { title: 'Armenia', emoji: '🇦🇲' },
  'en:azerbaijan': { title: 'Azerbaijan', emoji: '🇦🇿' },
  'en:kazakhstan': { title: 'Kazakhstan', emoji: '🇰🇿' },
  'en:uzbekistan': { title: 'Uzbekistan', emoji: '🇺🇿' },
  'en:kyrgyzstan': { title: 'Kyrgyzstan', emoji: '🇰🇬' },
  'en:tajikistan': { title: 'Tajikistan', emoji: '🇹🇯' },
  'en:turkmenistan': { title: 'Turkmenistan', emoji: '🇹🇲' },
  'en:mongolia': { title: 'Mongolia', emoji: '🇲🇳' },
  'en:north-korea': { title: 'North Korea', emoji: '🇰🇵' },
  'en:myanmar': { title: 'Myanmar', emoji: '🇲🇲' },
  'en:laos': { title: 'Laos', emoji: '🇱🇦' },
  'en:cambodia': { title: 'Cambodia', emoji: '🇰🇭' },
  'en:brunei': { title: 'Brunei', emoji: '🇧🇳' },
  'en:taiwan': { title: 'Taiwan', emoji: '🇹🇼' },
  'en:hong-kong': { title: 'Hong Kong', emoji: '🇭🇰' },
  'en:macau': { title: 'Macau', emoji: '🇲🇴' },
};

/**
 * Get country info from Open Food Facts country code
 */
export function getCountryInfoFromCode(countryCode: string): CountryInfo | null {
  const key = countryCode.trim().toLowerCase();
  return COUNTRY_MAP[key] || null;
}

/**
 * Get the CSS classes for country tags - consistent styling across the app
 * Uses the indigo color scheme from colours.tags.countries
 */
export function getCountryTagClasses(): string {
  return "inline-block text-sm px-3 py-1.5 rounded-full font-medium shadow-lg transition-all duration-200";
}

/**
 * Get the inline styles for country tags using colours.tags.countries
 */
export function getCountryTagStyles() {
  return {
    backgroundColor: colours.tags.countries.background, // 20% opacity for lighter background
    borderColor: colours.tags.countries.border,
    borderWidth: '2px',
    borderStyle: 'solid',
    color: colours.tags.countries.border, // Use border color for text for better contrast
  };
}

/**
 * Get the hover styles for country tags
 */
export function getCountryTagHoverStyles() {
  return {
    backgroundColor: `${colours.tags.countries.background}30`, // 30% opacity for hover
    color: colours.tags.countries.background,
  };
}

/**
 * Format country display (includes emoji and title)
 */
export function formatCountryDisplay(countryInfo: CountryInfo): string {
  return `${countryInfo.emoji} ${countryInfo.title}`;
}
