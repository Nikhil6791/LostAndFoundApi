import asyncHandler from "express-async-handler";
import {
  getPendingFoundItemsService,
  approveFoundItemService,
  rejectFoundItemService,
  markFoundItemReturnedService,
} from "../found/found.service.js";

export const getPendingFoundItems = asyncHandler(async (req, res) => {
  const items = await getPendingFoundItemsService();

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

export const approveFoundItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await approveFoundItemService(id);

  res.status(200).json({
    success: true,
    message: "Found item approved successfully",
    data: item,
  });
});

export const rejectFoundItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await rejectFoundItemService(id);

  res.status(200).json({
    success: true,
    message: "Found item rejected and removed successfully",
  });
});

export const markFoundItemReturned = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await markFoundItemReturnedService(id);

  res.status(200).json({
    success: true,
    message: "Found item marked as returned successfully",
    data: item,
  });
});
