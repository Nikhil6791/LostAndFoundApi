import asyncHandler from "../../utils/asyncHandler.js";
import {
  getDashboardStatsService,
  getDashboardCategoriesService,
  getDashboardTrendsService,
} from "./dashboard.service.js";

// Shared by both the authenticated admin dashboard route and the public
// user-facing dashboard route — the underlying data never includes reporter
// contact info, so the same handler is safe to expose either way.
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsService();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const getDashboardCategories = asyncHandler(async (req, res) => {
  const data = await getDashboardCategoriesService();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getDashboardTrends = asyncHandler(async (req, res) => {
  let days = parseInt(req.query.days, 10);
  if (!Number.isInteger(days) || days < 1) days = 30;
  if (days > 90) days = 90;

  const data = await getDashboardTrendsService(days);

  res.status(200).json({
    success: true,
    data,
  });
});
