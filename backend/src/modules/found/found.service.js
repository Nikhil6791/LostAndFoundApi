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
