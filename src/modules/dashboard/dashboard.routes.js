import express from "express";
import {
  getDashboardStats,
  getDashboardCategories,
  getDashboardTrends,
} from "./dashboard.controller.js";

// Public — no authenticate middleware. Safe because the dashboard data is
// aggregate counts and category labels only, never reporter contact info.
const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/categories", getDashboardCategories);
router.get("/trends", getDashboardTrends);

export default router;
