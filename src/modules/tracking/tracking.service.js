import prisma from "../../config/prisma.js";

// Every field here maps directly to a real database fact — no invented
// "in progress" states. SEARCHING is reached as soon as PUBLISHED is (once a
// report is live, it's in the matching pool, whether or not a match has hit yet);
// it isn't "undone" once a match is found or the item is returned — it's a
// historical milestone, not a live status.
const buildTimeline = ({ published, matchFound, returned }) => [
  { step: "SUBMITTED", label: "Report Submitted", completed: true },
  { step: "PUBLISHED", label: "Report Published", completed: published },
  { step: "SEARCHING", label: "Searching for Match", completed: published },
  { step: "MATCH_FOUND", label: "Potential Match Found", completed: matchFound },
  { step: "RETURNED", label: "Returned", completed: returned },
];

const buildLostReportView = async (lostItem) => {
  // "Has this item ever been matched" is a historical fact, so it checks for any
  // Match row at all — not just ones that are still currently actionable (that's
  // a different question, used by the admin matches list/dashboard instead).
  const matchCount = await prisma.match.count({ where: { lostItemId: lostItem.id } });
  const returned = lostItem.status === "RETURNED";

  return {
    trackingId: lostItem.trackingId,
    reportType: "LOST",
    title: lostItem.title,
    category: lostItem.category,
    status: lostItem.status,
    createdAt: lostItem.createdAt,
    hasPotentialMatch: matchCount > 0,
    // Lost reports go live immediately — there's no admin approval gate for them.
    timeline: buildTimeline({ published: true, matchFound: matchCount > 0, returned }),
  };
};

const buildFoundReportView = async (foundItem) => {
  const matchCount = await prisma.match.count({ where: { foundItemId: foundItem.id } });
  const published = foundItem.status !== "PENDING";
  const returned = foundItem.status === "RETURNED";

  return {
    trackingId: foundItem.trackingId,
    reportType: "FOUND",
    title: foundItem.title,
    category: foundItem.category,
    status: foundItem.status,
    createdAt: foundItem.createdAt,
    hasPotentialMatch: matchCount > 0,
    timeline: buildTimeline({ published, matchFound: matchCount > 0, returned }),
  };
};

// A tracking ID is only ever assigned to one row across both tables (they share
// one counter), so trying LostItem first and falling back to FoundItem is safe —
// at most one of the two lookups will ever hit.
export const trackReportService = async (trackingId) => {
  const lostItem = await prisma.lostItem.findUnique({ where: { trackingId } });
  if (lostItem) return buildLostReportView(lostItem);

  const foundItem = await prisma.foundItem.findUnique({ where: { trackingId } });
  if (foundItem) return buildFoundReportView(foundItem);

  return null;
};
