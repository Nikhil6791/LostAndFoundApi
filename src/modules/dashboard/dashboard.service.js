import prisma from "../../config/prisma.js";

// None of these three functions touch reporterName/phone/email — only counts and
// category labels — which is what makes it safe to expose the same data through
// both the authenticated admin dashboard and the public user-facing dashboard.

// All eight counts run as one batched transaction — a single round trip to
// Postgres instead of eight sequential queries.
export const getDashboardStatsService = async () => {
  const [
    totalLostItems,
    totalFoundItems,
    pendingFoundReports,
    availableFoundItems,
    returnedFoundItems,
    returnedLostItems,
    potentialMatches,
  ] = await prisma.$transaction([
    prisma.lostItem.count(),
    prisma.foundItem.count(),
    prisma.foundItem.count({ where: { status: "PENDING" } }),
    prisma.foundItem.count({ where: { status: "AVAILABLE" } }),
    prisma.foundItem.count({ where: { status: "RETURNED" } }),
    prisma.lostItem.count({ where: { status: "RETURNED" } }),
    // Same "still actionable" definition used by the admin potential-matches list.
    prisma.match.count({
      where: { lostItem: { status: "ACTIVE" }, foundItem: { status: "AVAILABLE" } },
    }),
  ]);

  return {
    totalLostItems,
    totalFoundItems,
    pendingFoundReports,
    availableFoundItems,
    returnedFoundItems,
    returnedLostItems,
    returnedItems: returnedFoundItems + returnedLostItems,
    potentialMatches,
  };
};

// Per-category counts for lost vs found reports, merged into one row per category
// so the frontend can render "Reports by Category" without a second request.
export const getDashboardCategoriesService = async () => {
  const [lostByCategory, foundByCategory] = await prisma.$transaction([
    prisma.lostItem.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.foundItem.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const categoryMap = new Map();

  for (const row of lostByCategory) {
    categoryMap.set(row.category, { category: row.category, lostCount: row._count._all, foundCount: 0 });
  }

  for (const row of foundByCategory) {
    const existing = categoryMap.get(row.category);
    if (existing) {
      existing.foundCount = row._count._all;
    } else {
      categoryMap.set(row.category, { category: row.category, lostCount: 0, foundCount: row._count._all });
    }
  }

  return Array.from(categoryMap.values()).sort(
    (a, b) => b.lostCount + b.foundCount - (a.lostCount + a.foundCount),
  );
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

// Daily lost vs found report counts for the last `days` days (defaults to 30),
// with every day present (zero-filled) so the line chart has no gaps. `days`
// is validated/clamped by the controller before it ever reaches here.
//
// Buckets by dateLost/dateFound — the day the reporter says the item actually
// went missing/was found — not createdAt (when the report was typed in). This
// is the same field the existing Lost/Found list pages filter by, so a report
// submitted today about something lost on Aug 30 shows up under Aug 30 here
// too, matching what browsing the Lost Items page for that date already shows.
export const getDashboardTrendsService = async (days = 30) => {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const [lostRows, foundRows] = await prisma.$transaction([
    prisma.lostItem.findMany({ where: { dateLost: { gte: since } }, select: { dateLost: true } }),
    prisma.foundItem.findMany({ where: { dateFound: { gte: since } }, select: { dateFound: true } }),
  ]);

  const dayBuckets = new Map();
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setUTCDate(day.getUTCDate() + i);
    const key = toDateKey(day);
    dayBuckets.set(key, { date: key, lostCount: 0, foundCount: 0 });
  }

  for (const row of lostRows) {
    const bucket = dayBuckets.get(toDateKey(row.dateLost));
    if (bucket) bucket.lostCount += 1;
  }

  for (const row of foundRows) {
    const bucket = dayBuckets.get(toDateKey(row.dateFound));
    if (bucket) bucket.foundCount += 1;
  }

  return Array.from(dayBuckets.values());
};
