import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/ApiError.js";
import {
  sendFoundReportConfirmationEmail,
  sendFoundMatchEmail,
} from "../../services/emailService.js";

export const createFoundItemService = async (data) => {
  const foundItem = await prisma.foundItem.create({
    data,
  });

  await sendFoundReportConfirmationEmail(foundItem);

  return foundItem;
};

const normalize = (value) => value.trim().toLowerCase();

const titlesAreSimilar = (titleA, titleB) => {
  const normalizedA = normalize(titleA);
  const normalizedB = normalize(titleB);

  if (!normalizedA || !normalizedB) return false;
  if (normalizedA === normalizedB) return true;
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return true;
  }

  const wordsA = new Set(
    normalizedA.split(/\W+/).filter((word) => word.length > 2)
  );
  const wordsB = normalizedB.split(/\W+/).filter((word) => word.length > 2);

  return wordsB.some((word) => wordsA.has(word));
};

export const findMatchingLostItemsService = async (foundItem) => {
  const candidates = await prisma.lostItem.findMany({
    where: {
      status: "ACTIVE",
      category: { equals: foundItem.category, mode: "insensitive" },
    },
  });

  return candidates.filter((lostItem) =>
    titlesAreSimilar(lostItem.title, foundItem.title)
  );
};

export const notifyMatchingLostReportersService = async (foundItem) => {
  const matches = await findMatchingLostItemsService(foundItem);

  await Promise.all(
    matches.map((lostItem) => sendFoundMatchEmail(lostItem, foundItem))
  );

  return matches;
};

export const getAllFoundItemsService = async () => {
  return await prisma.foundItem.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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
        await notifyMatchingLostReportersService(approvedItem);
    } catch (error) {
        console.error("Failed to notify matching lost reporters:", error.message);
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