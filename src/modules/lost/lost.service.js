import prisma from "../../config/prisma.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/ApiError.js";
import { sendLostReportConfirmationEmail } from "../../services/emailService.js";
import {
  parsePagination,
  buildKeywordSearch,
  buildDateRangeFilter,
  buildPaginationMeta,
} from "../../utils/queryHelpers.js";
import { findAndRecordMatchesForLostItem } from "../matching/matching.service.js";
import { generateTrackingId } from "../../utils/trackingId.js";

export const createLostItemService = async (data, file) => {
  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, "lost-items");
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  // The counter increment and the item insert happen in one transaction — if the
  // insert fails, the tracking number isn't burned.
  const lostItem = await prisma.$transaction(async (tx) => {
    const trackingId = await generateTrackingId(tx);

    return tx.lostItem.create({
      data: {
        reporterName: data.reporterName,
        phone: data.phone,
        email: data.email,

        title: data.title,
        description: data.description,
        category: data.category,
        locationLost: data.locationLost,
        dateLost: data.dateLost,

        imageUrl,
        imagePublicId,
        trackingId,
      },
    });
  });

  await sendLostReportConfirmationEmail(lostItem);

  try {
    await findAndRecordMatchesForLostItem(lostItem);
  } catch (error) {
    console.error("Failed to run match check for new lost item:", error.message);
  }

  return lostItem;
};

export const getAllLostItemsService = async (query = {}) => {
  const { search, category, location, date, status } = query;
  const { page, limit, skip } = parsePagination(query);

  const where = {
    ...buildKeywordSearch(search, ["title", "description"]),
  };

  if (category) where.category = { equals: category, mode: "insensitive" };
  if (location) where.locationLost = { contains: location, mode: "insensitive" };
  if (status) where.status = status;

  if (date) {
    const dateRange = buildDateRangeFilter(date);
    if (dateRange) where.dateLost = dateRange;
  }

  const findManyArgs = { where, orderBy: { createdAt: "desc" }, skip };
  if (limit !== null) findManyArgs.take = limit;

  const [items, total] = await prisma.$transaction([
    prisma.lostItem.findMany(findManyArgs),
    prisma.lostItem.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(total, page, limit) };
};

export const getLostItemByIdService = async (id) => {
  return await prisma.lostItem.findUnique({
    where: {
      id,
    },
  });
};

export const deleteLostItemService = async (id) => {
  const lostItem = await prisma.lostItem.findUnique({
    where: { id },
  });

  if (!lostItem) {
    throw new Error("Lost item not found");
  }

  if (lostItem.imagePublicId) {
    await cloudinary.uploader.destroy(lostItem.imagePublicId);
  }

  const deletedItem = await prisma.lostItem.delete({
    where: { id },
  });

  return deletedItem;
};

export const markLostItemReturnedService = async (id) => {
  const lostItem = await prisma.lostItem.findUnique({ where: { id } });

  if (!lostItem) {
    throw new ApiError(404, "Lost item not found");
  }

  if (lostItem.status !== "ACTIVE") {
    throw new ApiError(400, "Only active lost items can be marked as returned");
  }

  return prisma.lostItem.update({
    where: { id },
    data: { status: "RETURNED" },
  });
};
