import asyncHandler from "express-async-handler";
import { createFoundItemService } from "./found.service.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { getAllFoundItemsService } from "./found.service.js";
import { getFoundItemByIdService } from "./found.service.js";
import {
    updateFoundItemService,
} from "./found.service.js";
import cloudinary from "../../config/cloudinary.js";
import { deleteFoundItemService } from "./found.service.js";

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

export const getFoundItemById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const item = await getFoundItemByIdService(id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: "Found item not found",
        });
    }

    res.status(200).json({
        success: true,
        data: item,
    });

});

export const updateFoundItem = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const existingItem = await getFoundItemByIdService(id);

    if (!existingItem) {
        return res.status(404).json({
            success: false,
            message: "Found item not found",
        });
    }

    const updateData = {
        reporterName: req.body.reporterName,
        phone: req.body.phone,
        email: req.body.email,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        locationFound: req.body.locationFound,
        dateFound: req.body.dateFound
            ? new Date(req.body.dateFound)
            : existingItem.dateFound,
    };

    if (req.file) {

        // Delete old image
        await cloudinary.uploader.destroy(existingItem.imagePublicId);

        // Upload new image
        const image = await uploadToCloudinary(
            req.file.buffer,
            "found-items"
        );

        updateData.imageUrl = image.secure_url;
        updateData.imagePublicId = image.public_id;
    }

    const updatedItem = await updateFoundItemService(id, updateData);

    res.status(200).json({
        success: true,
        message: "Found item updated successfully",
        data: updatedItem,
    });

});

export const deleteFoundItem = asyncHandler(async (req, res) => {

    const { id } = req.params;

    await deleteFoundItemService(id);

    res.status(200).json({
        success: true,
        message: "Found item deleted successfully",
    });

});