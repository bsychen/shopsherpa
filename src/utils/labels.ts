/* Label mapping: maps Open Food Facts label codes to display name and emoji */
export const LABEL_MAP: Record<string, { title: string; emoji: string }> = {
  'en:vegetarian': { title: 'Vegetarian', emoji: '🥦' },
  'en:vegan': { title: 'Vegan', emoji: '🌱' },
  'en:organic': { title: 'Organic', emoji: '🍃' },
  'en:halal': { title: 'Halal', emoji: '🕌' },
  'en:kosher': { title: 'Kosher', emoji: '✡️' },
  'en:palm-oil-free': { title: 'Palm Oil Free', emoji: '🌴🚫' },
  'en:fair-trade': { title: 'Fair Trade', emoji: '🤝' },
  'en:lactose-free': { title: 'Lactose-Free', emoji: '🥛🚫' },
};

export function getLabelInfo(labelCode: string): { title: string; emoji: string } | null {
  const key = labelCode.trim().toLowerCase();
  return LABEL_MAP[key] || null;
}

export function formatLabelDisplay(labelInfo: { title: string; emoji: string }): string {
  return `${labelInfo.emoji} ${labelInfo.title}`;
}
