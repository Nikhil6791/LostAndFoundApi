import prisma from "../../config/prisma.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

import cloudinary from "../../config/cloudinary.js";
import { sendLostReportConfirmationEmail } from "../../services/emailService.js";

export const createLostItemService = async (data, file) => {
  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, "lost-items");
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  const lostItem = await prisma.lostItem.create({
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
    },
  });

  await sendLostReportConfirmationEmail(lostItem);

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
