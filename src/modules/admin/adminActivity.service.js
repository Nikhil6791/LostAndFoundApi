import prisma from "../../config/prisma.js";

// No dedicated "activity log" table exists (and adding one just for this would
// be a table for the sake of a table) — a lost/found report's own createdAt
// already *is* the activity event, so we just pull the most recent rows from
// both tables and merge them into one feed sorted by time.
export const getRecentActivityService = async (limit = 20) => {
  const [lostItems, foundItems] = await prisma.$transaction([
    prisma.lostItem.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, category: true, trackingId: true, createdAt: true },
    }),
    prisma.foundItem.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, category: true, trackingId: true, createdAt: true },
    }),
  ]);

  const activity = [
    ...lostItems.map((item) => ({ type: "LOST_CREATED", ...item })),
    ...foundItems.map((item) => ({ type: "FOUND_CREATED", ...item })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return activity.slice(0, limit);
};
