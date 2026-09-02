import asyncHandler from "../../utils/asyncHandler.js";
import { createLostItemService } from "./lost.service.js";
import { getAllLostItemsService } from "./lost.service.js";
import { getLostItemByIdService } from "./lost.service.js";
import { deleteLostItemService } from "./lost.service.js";

export const createLostItem = asyncHandler(async (req, res) => {
  const [year, month, day] = req.body.dateLost.split("-");

  const dateLost = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

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
  const { items, pagination } = await getAllLostItemsService(req.query);

  res.status(200).json({
    success: true,
    count: items.length,
    pagination,
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

export const deleteLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteLostItemService(id);

  res.status(200).json({
    success: true,
    message: "Lost item deleted successfully",
  });
});
