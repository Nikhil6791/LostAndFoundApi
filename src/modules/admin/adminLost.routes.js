import express from "express";
import authenticate from "../../middleware/auth.js";
import { markLostItemReturned } from "./adminLost.controller.js";

const router = express.Router();

router.patch("/:id/returned", authenticate, markLostItemReturned);

export default router;
