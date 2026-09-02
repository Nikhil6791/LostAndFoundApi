// One-time backfill: assigns a trackingId to every LostItem/FoundItem row that
// doesn't have one yet (i.e. rows created before this feature existed). Safe to
// re-run — rows that already have a trackingId are skipped.
//
// Run with: node prisma/backfillTrackingIds.mjs

import prisma from "../src/config/prisma.js";

const run = async () => {
  const [lostItems, foundItems] = await Promise.all([
    prisma.lostItem.findMany({ where: { trackingId: null }, select: { id: true, createdAt: true } }),
    prisma.foundItem.findMany({ where: { trackingId: null }, select: { id: true, createdAt: true } }),
  ]);

  // Merge both tables and sort by creation time so tracking numbers are handed
  // out in the same order reports were actually submitted, system-wide.
  const rows = [
    ...lostItems.map((item) => ({ ...item, table: "lostItem" })),
    ...foundItems.map((item) => ({ ...item, table: "foundItem" })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  for (const row of rows) {
    const year = row.createdAt.getFullYear();

    const counter = await prisma.trackingCounter.upsert({
      where: { year },
      create: { year, value: 1 },
      update: { value: { increment: 1 } },
    });

    const trackingId = `LF-${year}-${String(counter.value).padStart(5, "0")}`;

    await prisma[row.table].update({
      where: { id: row.id },
      data: { trackingId },
    });

    console.log(`${row.table} ${row.id} -> ${trackingId}`);
  }

  console.log(`Backfilled ${rows.length} row(s).`);
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
