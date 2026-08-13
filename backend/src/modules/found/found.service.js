import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
export const createFoundItemService = async (data) => {
  const foundItem = await prisma.foundItem.create({
    data,
  });

  return foundItem;
};

export const getAllFoundItemsService = async () => {
  return await prisma.foundItem.findMany({
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