import asyncHandler from "../../utils/asyncHandler.js";
import { createLostItemService } from "./lost.service.js";

export const createLostItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  const lostItem = await createLostItemService(
    req.body,
    req.file,
    req.admin.id,
  );

  res.status(201).json({
    success: true,
    message: "Lost item created successfully",
    data: lostItem,
  });
});
