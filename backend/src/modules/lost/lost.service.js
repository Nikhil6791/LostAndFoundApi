import prisma from "../../config/prisma.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";


import  cloudinary  from "../../config/cloudinary.js";



export const createLostItemService = async (data, file, adminId) => {
  const uploadResult = await uploadToCloudinary(file.buffer, "lost-items");

  const lostItem = await prisma.lostItem.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      locationLost: data.locationLost,
      dateLost: new Date(data.dateLost),

      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,

      createdBy: adminId,
    },
  });

  return lostItem;
};

export const getAllLostItemsService = async () => {
  return await prisma.lostItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getLostItemByIdService = async (id) => {

    return await prisma.lostItem.findUnique({
        where: {
            id,
        },
    });

};

export const updateLostItemService = async (id, data) => {

    return await prisma.lostItem.update({
        where: {
            id,
        },
        data,
    });

};



export const deleteLostItemService = async (id) => {

    const lostItem = await prisma.lostItem.findUnique({
        where: { id }
    });

    if (!lostItem) {
        throw new Error("Lost item not found");
    }

    console.log("Public ID:", lostItem.imagePublicId);

    const result = await cloudinary.uploader.destroy(
        lostItem.imagePublicId
    );

    console.log("Cloudinary Result:", result);

    const deletedItem = await prisma.lostItem.delete({
        where: { id }
    });

    return deletedItem;
};