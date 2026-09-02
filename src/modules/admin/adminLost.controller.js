import asyncHandler from "../../utils/asyncHandler.js";
import { markLostItemReturnedService } from "../lost/lost.service.js";

export const markLostItemReturned = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await markLostItemReturnedService(id);

  res.status(200).json({
    success: true,
    message: "Lost item marked as returned successfully",
    data: item,
  });
});
