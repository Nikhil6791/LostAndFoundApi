import prisma from "../../config/prisma.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

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
