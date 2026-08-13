import prisma from "../../config/prisma.js";

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