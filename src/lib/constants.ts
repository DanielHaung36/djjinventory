// src/lib/constants.ts
export const CATEGORIES = ["Machine", "Parts", "Tools", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];