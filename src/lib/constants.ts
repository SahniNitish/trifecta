export const CATEGORIES = [
  'Food',
  'Groceries',
  'Rent',
  'Transport',
  'Fitness',
  'Fun',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍔',
  Groceries: '🛒',
  Rent: '🏠',
  Transport: '🚗',
  Fitness: '💪',
  Fun: '🎉',
  Other: '📦',
};

export const PRIORITY_COLORS = {
  low: 'bg-muted',
  med: 'bg-amber',
  high: 'bg-danger',
};