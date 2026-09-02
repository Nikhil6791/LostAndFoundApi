import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/ApiError.js";
import { sendFoundReportConfirmationEmail } from "../../services/emailService.js";
import {
  parsePagination,
  buildKeywordSearch,
  buildDateRangeFilter,
  buildPaginationMeta,
} from "../../utils/queryHelpers.js";
import { findAndRecordMatchesForFoundItem } from "../matching/matching.service.js";
import { generateTrackingId } from "../../utils/trackingId.js";

export const createFoundItemService = async (data) => {
  const foundItem = await prisma.$transaction(async (tx) => {
    const trackingId = await generateTrackingId(tx);
    return tx.foundItem.create({ data: { ...data, trackingId } });
  });

  await sendFoundReportConfirmationEmail(foundItem);

  return foundItem;
};

export const getAllFoundItemsService = async (query = {}) => {
  const { search, category, location, date, status } = query;
  const { page, limit, skip } = parsePagination(query);

  // Default stays AVAILABLE-only so unmoderated PENDING reports are never public;
  // the validation layer only lets `status` be AVAILABLE or RETURNED anyway.
  const where = {
    status: status || "AVAILABLE",
    ...buildKeywordSearch(search, ["title", "description"]),
  };

  if (category) where.category = { equals: category, mode: "insensitive" };
  if (location) where.locationFound = { contains: location, mode: "insensitive" };

  if (date) {
    const dateRange = buildDateRangeFilter(date);
    if (dateRange) where.dateFound = dateRange;
  }

  const findManyArgs = { where, orderBy: { createdAt: "desc" }, skip };
  if (limit !== null) findManyArgs.take = limit;

  const [items, total] = await prisma.$transaction([
    prisma.foundItem.findMany(findManyArgs),
    prisma.foundItem.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(total, page, limit) };
};


export const getFoundItemByIdService = async (id) => {
    return await prisma.foundItem.findUnique({
        where: {
            id,
        },
    });
};

export const updateFoundItemService = async (id, data) => {
    return await prisma.foundItem.update({
        where: {
            id,
        },
        data,
    });
};

export const deleteFoundItemService = async (id) => {

    // Check if item exists
    const foundItem = await prisma.foundItem.findUnique({
        where: { id }
    });

    if (!foundItem) {
        throw new Error("Found item not found");
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(foundItem.imagePublicId);

    // Delete database record
    const deletedItem = await prisma.foundItem.delete({
        where: { id }
    });

    return deletedItem;
};

export const getPendingFoundItemsService = async () => {
    return await prisma.foundItem.findMany({
        where: {
            status: "PENDING",
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const approveFoundItemService = async (id) => {
    const foundItem = await prisma.foundItem.findUnique({
        where: { id },
    });

    if (!foundItem) {
        throw new ApiError(404, "Found item not found");
    }

    if (foundItem.status !== "PENDING") {
        throw new ApiError(400, "Only pending found items can be approved");
    }

    const approvedItem = await prisma.foundItem.update({
        where: { id },
        data: { status: "AVAILABLE" },
    });

    try {
        await findAndRecordMatchesForFoundItem(approvedItem);
    } catch (error) {
        console.error("Failed to run match check for approved found item:", error.message);
    }

    return approvedItem;
};

export const rejectFoundItemService = async (id) => {
    const foundItem = await prisma.foundItem.findUnique({
        where: { id },
    });

    if (!foundItem) {
        throw new ApiError(404, "Found item not found");
    }

    if (foundItem.status !== "PENDING") {
        throw new ApiError(400, "Only pending found items can be rejected");
    }

    // Delete image from Cloudinary before removing the record
    await cloudinary.uploader.destroy(foundItem.imagePublicId);

    // Delete database record
    const deletedItem = await prisma.foundItem.delete({
        where: { id },
    });

    return deletedItem;
};

export const markFoundItemReturnedService = async (id) => {
    const foundItem = await prisma.foundItem.findUnique({
        where: { id },
    });

    if (!foundItem) {
        throw new ApiError(404, "Found item not found");
    }

    if (foundItem.status !== "AVAILABLE") {
        throw new ApiError(400, "Only available found items can be marked as returned");
    }

    return await prisma.foundItem.update({
        where: { id },
        data: { status: "RETURNED" },
    });
};