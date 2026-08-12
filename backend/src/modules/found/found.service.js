import prisma from "../../config/prisma.js";

export const createFoundItemService = async (data) => {

    const foundItem = await prisma.foundItem.create({
        data
    });

    return foundItem;
};