// Pure scoring functions — no database access here. Keeping the scoring math
// separate from the DB-touching orchestration in matching.service.js means the
// weights/thresholds below can be retuned without touching anything else.

// How many of the 100 total points each factor is worth.
export const MATCH_WEIGHTS = {
  category: 30,
  title: 20,
  description: 10,
  location: 20,
  date: 20,
};

// A pair scoring below `potential` is not considered a match at all.
export const MATCH_THRESHOLDS = {
  potential: 70,
  strong: 85,
};

const STOPWORDS = new Set([
  "the", "and", "with", "for", "from", "this", "that", "have", "has",
  "was", "were", "are", "its", "a", "an", "of", "in", "on", "at", "my",
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
};

// Jaccard similarity: (shared words) / (total unique words) across both texts.
// 1 = identical wording, 0 = nothing in common.
const wordOverlapRatio = (textA, textB) => {
  const setA = new Set(tokenize(textA));
  const setB = new Set(tokenize(textB));

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

const categoryMatchRatio = (categoryA, categoryB) => {
  if (!categoryA || !categoryB) return 0;
  return categoryA.trim().toLowerCase() === categoryB.trim().toLowerCase() ? 1 : 0;
};

// The closer the found-date is to the lost-date, the more likely it's the same item.
// Expressed as a lookup table (not a formula) so the curve is easy to eyeball and tweak.
const DATE_PROXIMITY_BUCKETS = [
  { maxDays: 3, ratio: 1 },
  { maxDays: 7, ratio: 0.75 },
  { maxDays: 14, ratio: 0.5 },
  { maxDays: 30, ratio: 0.25 },
];

const dateProximityRatio = (dateA, dateB) => {
  if (!dateA || !dateB) return 0;

  const diffDays = Math.abs(new Date(dateA) - new Date(dateB)) / (1000 * 60 * 60 * 24);

  const bucket = DATE_PROXIMITY_BUCKETS.find((b) => diffDays <= b.maxDays);
  return bucket ? bucket.ratio : 0;
};

// Scores one lost item against one found item. Returns the total (0-100) plus
// a per-factor breakdown so the reason for a match is visible, not a black box.
export const scoreMatch = (lostItem, foundItem) => {
  const breakdown = {
    category: Math.round(categoryMatchRatio(lostItem.category, foundItem.category) * MATCH_WEIGHTS.category),
    title: Math.round(wordOverlapRatio(lostItem.title, foundItem.title) * MATCH_WEIGHTS.title),
    description: Math.round(
      wordOverlapRatio(lostItem.description, foundItem.description) * MATCH_WEIGHTS.description,
    ),
    location: Math.round(
      wordOverlapRatio(lostItem.locationLost, foundItem.locationFound) * MATCH_WEIGHTS.location,
    ),
    date: Math.round(dateProximityRatio(lostItem.dateLost, foundItem.dateFound) * MATCH_WEIGHTS.date),
  };

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return { score, breakdown };
};

export const classifyScore = (score) => {
  if (score >= MATCH_THRESHOLDS.strong) return "STRONG";
  if (score >= MATCH_THRESHOLDS.potential) return "POTENTIAL";
  return "NONE";
};
