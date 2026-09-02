import prisma from "../../config/prisma.js";
import { scoreMatch, MATCH_THRESHOLDS } from "./scoring.js";
import { sendPotentialMatchEmail } from "../../services/emailService.js";
import { parsePagination, buildPaginationMeta } from "../../utils/queryHelpers.js";

// Category is indexed, so we let SQL narrow the field first and only run the
// heavier text/date scoring in JS on the (usually small) remaining set —
// this is what "avoid unnecessary database queries" means in practice here.
const findCandidateFoundItems = (lostItem) =>
  prisma.foundItem.findMany({
    where: {
      status: "AVAILABLE",
      category: { equals: lostItem.category, mode: "insensitive" },
    },
  });

const findCandidateLostItems = (foundItem) =>
  prisma.lostItem.findMany({
    where: {
      status: "ACTIVE",
      category: { equals: foundItem.category, mode: "insensitive" },
    },
  });

// Creates the Match row the first time a pair crosses the threshold. If the pair
// was already recorded (e.g. one of the items was edited and re-scored), only the
// score is refreshed — we never send a second email for the same pair.
const recordMatchIfNew = async (lostItemId, foundItemId, score) => {
  const existing = await prisma.match.findUnique({
    where: { lostItemId_foundItemId: { lostItemId, foundItemId } },
  });

  if (existing) {
    if (existing.score !== score) {
      await prisma.match.update({ where: { id: existing.id }, data: { score } });
    }
    return null;
  }

  return prisma.match.create({
    data: { lostItemId, foundItemId, score, notifiedAt: new Date() },
  });
};

export const findAndRecordMatchesForLostItem = async (lostItem) => {
  const candidates = await findCandidateFoundItems(lostItem);
  const newlyMatched = [];

  for (const foundItem of candidates) {
    const { score } = scoreMatch(lostItem, foundItem);
    if (score < MATCH_THRESHOLDS.potential) continue;

    const created = await recordMatchIfNew(lostItem.id, foundItem.id, score);
    if (created) newlyMatched.push({ foundItem, score });
  }

  for (const { foundItem, score } of newlyMatched) {
    await sendPotentialMatchEmail(lostItem, foundItem, score);
  }

  return newlyMatched;
};

export const findAndRecordMatchesForFoundItem = async (foundItem) => {
  const candidates = await findCandidateLostItems(foundItem);
  const newlyMatched = [];

  for (const lostItem of candidates) {
    const { score } = scoreMatch(lostItem, foundItem);
    if (score < MATCH_THRESHOLDS.potential) continue;

    const created = await recordMatchIfNew(lostItem.id, foundItem.id, score);
    if (created) newlyMatched.push({ lostItem, score });
  }

  for (const { lostItem, score } of newlyMatched) {
    await sendPotentialMatchEmail(lostItem, foundItem, score);
  }

  return newlyMatched;
};

// Powers the admin "potential matches" list. Only shows pairs where both sides are
// still active/available — once either item is returned, the match is no longer
// actionable and shouldn't clutter the review queue.
export const getPotentialMatchesForAdminService = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    lostItem: { status: "ACTIVE" },
    foundItem: { status: "AVAILABLE" },
  };

  const findManyArgs = {
    where,
    orderBy: { score: "desc" },
    skip,
    include: { lostItem: true, foundItem: true },
  };
  if (limit !== null) findManyArgs.take = limit;

  const [matches, total] = await prisma.$transaction([
    prisma.match.findMany(findManyArgs),
    prisma.match.count({ where }),
  ]);

  return { matches, pagination: buildPaginationMeta(total, page, limit) };
};
