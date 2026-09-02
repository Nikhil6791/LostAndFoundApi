import asyncHandler from "../../utils/asyncHandler.js";
import { getRecentActivityService } from "./adminActivity.service.js";

export const getRecentActivity = asyncHandler(async (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (limit > 50) limit = 50;

  const data = await getRecentActivityService(limit);

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});
