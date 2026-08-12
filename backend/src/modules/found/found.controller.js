import asyncHandler from "express-async-handler";
import { createFoundItemService } from "./found.service.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { getAllFoundItemsService } from "./found.service.js";
export const createFoundItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  const [day, month, year] = req.body.dateFound.split("-");

  const dateFound = new Date(`${year}-${month}-${day}`);
  const image = await uploadToCloudinary(req.file.buffer, "found-items");

  const foundItem = await createFoundItemService({
    reporterName: req.body.reporterName,
    phone: req.body.phone,
    email: req.body.email,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    locationFound: req.body.locationFound,
    dateFound: dateFound,
    imageUrl: image.secure_url,
    imagePublicId: image.public_id,
  });

  res.status(201).json({
    success: true,
    message: "Found item created successfully",
    data: foundItem,
  });
});

export const getAllFoundItems = asyncHandler(async (req, res) => {
  const items = await getAllFoundItemsService();

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});
