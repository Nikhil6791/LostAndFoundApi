import asyncHandler from "../../utils/asyncHandler.js";
import { createLostItemService } from "./lost.service.js";
import { getAllLostItemsService } from "./lost.service.js";
import { getLostItemByIdService } from "./lost.service.js";
import { updateLostItemService } from "./lost.service.js";
import { deleteLostItemService } from "./lost.service.js";

export const createLostItem = asyncHandler(async (req, res) => {
  const [day, month, year] = req.body.dateLost.split("-");
  const dateLost = new Date(`${year}-${month}-${day}`);
  const lostItem = await createLostItemService(
    {
      ...req.body,
      dateLost,
    },
    req.file,
  );

  res.status(201).json({
    success: true,
    message: "Lost item created successfully",
    data: lostItem,
  });
});

export const getAllLostItems = asyncHandler(async (req, res) => {
  const items = await getAllLostItemsService();

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

export const getLostItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await getLostItemByIdService(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Lost item not found",
    });
  }

  res.status(200).json({
    success: true,
    data: item,
  });
});

export const updateLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingItem = await getLostItemByIdService(id);

  if (!existingItem) {
    return res.status(404).json({
      success: false,
      message: "Lost item not found",
    });
  }

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    locationLost: req.body.locationLost,
    dateLost: req.body.dateLost
      ? new Date(req.body.dateLost)
      : existingItem.dateLost,
  };

  if (req.file) {
    updateData.imageUrl = req.file.path;
    updateData.imagePublicId = req.file.filename;
  }

  const updatedItem = await updateLostItemService(id, updateData);

  res.status(200).json({
    success: true,
    message: "Lost item updated successfully",
    data: updatedItem,
  });
});

export const deleteLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteLostItemService(id);

  res.status(200).json({
    success: true,
    message: "Lost item deleted successfully",
  });
});
