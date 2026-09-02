import express from "express";
import authenticate from "../../middleware/auth.js";
import { getRecentActivity } from "./adminActivity.controller.js";

const router = express.Router();

router.get("/", authenticate, getRecentActivity);

export default router;
