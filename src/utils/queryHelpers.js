const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Turns ?page=&limit= into safe numbers Prisma can use for skip/take.
// If neither is supplied, pagination is skipped entirely (limit: null) so
// existing callers that expect the full list back (e.g. the admin panel's
// item-management tables) keep working exactly as before this feature existed.
export const parsePagination = (query) => {
  if (query.page === undefined && query.limit === undefined) {
    return { page: 1, limit: null, skip: 0 };
  }

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
};

// Builds a Prisma OR clause that matches the keyword against several text fields.
export const buildKeywordSearch = (search, fields) => {
  if (!search) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    })),
  };
};

// Turns a "YYYY-MM-DD" string into a [start of day, start of next day) range in UTC,
// since the dateLost/dateFound columns are stored as UTC midnight for that day.
export const buildDateRangeFilter = (dateString) => {
  const start = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { gte: start, lt: end };
};

// When limit is null (no pagination requested), the whole result set is "page 1".
export const buildPaginationMeta = (total, page, limit) => {
  if (limit === null) {
    return { page: 1, limit: total, total, totalPages: 1 };
  }

  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
};
