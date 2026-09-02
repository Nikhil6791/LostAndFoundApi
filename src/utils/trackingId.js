// Generates a short public code like "LF-2026-00124" that a reporter can use to
// check their report's status without an account. `tx` should be a Prisma
// transaction client so the counter increment and the item insert that uses it
// either both happen or neither does — otherwise a failed insert would burn a
// number and leave a permanent gap.
export const generateTrackingId = async (tx) => {
  const year = new Date().getFullYear();

  const counter = await tx.trackingCounter.upsert({
    where: { year },
    create: { year, value: 1 },
    update: { value: { increment: 1 } },
  });

  return `LF-${year}-${String(counter.value).padStart(5, "0")}`;
};
