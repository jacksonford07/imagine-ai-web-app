// Product taxonomy lives in code, not inferred from product names at read time.
// Every transaction classifies into the four-tier ascension ladder (LTO → MTO →
// HTO → PTO) or the off-ladder SaaS/Content/Other bucket. Product-name fuzziness
// is resolved here once.

export type LadderTier = "LTO" | "MTO" | "HTO" | "PTO";
export type TierKey = LadderTier | "OTHER";

export interface TierDef {
  key: TierKey;
  /** Full name shown as the card heading. */
  name: string;
  /** Short ladder label. */
  short: string;
  /** What this rung represents in the ascension model. */
  description: string;
  /** Representative product names that classify into this tier. */
  products: string[];
  /** chart-1..5 color slot for consistent theming. */
  chart: 1 | 2 | 3 | 4 | 5;
  /** True for the four ascension rungs; false for off-ladder revenue. */
  onLadder: boolean;
}

// Ordered low → high. The four ladder rungs render as the ascension funnel;
// OTHER is surfaced separately as real-but-off-ladder revenue.
export const TIERS: TierDef[] = [
  {
    key: "LTO",
    name: "Low Ticket Offer",
    short: "LTO",
    description: "Front-end entry products and order bumps.",
    products: [
      "Imagine Education (Whop)",
      "The Ai Model Method",
      "Order Bumps",
      "OTO 1",
    ],
    chart: 1,
    onLadder: true,
  },
  {
    key: "MTO",
    name: "Mid Ticket Offer",
    short: "MTO",
    description: "Productised AI model offers and setup packages.",
    products: [
      "AI Model Products",
      "AI Model Setup Package",
      "AI Marketplace Model",
    ],
    chart: 4,
    onLadder: true,
  },
  {
    key: "HTO",
    name: "High Ticket Offer",
    short: "HTO",
    description: "AiM Mentorship (Whop and Fanbasis).",
    products: ["AiM Mentorship (Whop)", "AiM Mentorship (Fanbasis)"],
    chart: 5,
    onLadder: true,
  },
  {
    key: "PTO",
    name: "Premium Ticket Offer",
    short: "PTO",
    description: "Premium AiM Mentorship — top of the ladder.",
    products: ["Premium AiM Mentorship"],
    chart: 2,
    onLadder: true,
  },
  {
    key: "OTHER",
    name: "SaaS / Content / Other",
    short: "Other",
    description:
      "Real revenue that doesn't belong in the ladder — tools, content, extensions.",
    products: [
      "AI Content Generator",
      "Content Packs",
      "Twitter Management",
      "Mentorship Extensions",
    ],
    chart: 3,
    onLadder: false,
  },
];

export const LADDER_TIERS: TierDef[] = TIERS.filter((t) => t.onLadder);

export function getTier(key: TierKey): TierDef {
  const tier = TIERS.find((t) => t.key === key);
  if (tier === undefined) throw new Error(`unknown tier: ${key}`);
  return tier;
}
