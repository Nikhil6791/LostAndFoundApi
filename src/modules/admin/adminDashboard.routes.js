import express from "express";
import authenticate from "../../middleware/auth.js";
import {
  getDashboardStats,
  getDashboardCategories,
  getDashboardTrends,
} from "../dashboard/dashboard.controller.js";

const router = express.Router();

router.get("/stats", authenticate, getDashboardStats);
router.get("/categories", authenticate, getDashboardCategories);
router.get("/trends", authenticate, getDashboardTrends);

export default router;
