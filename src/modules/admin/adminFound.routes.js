import express from "express";
import authenticate from "../../middleware/auth.js";
import {
  getPendingFoundItems,
  approveFoundItem,
  rejectFoundItem,
  markFoundItemReturned,
} from "./adminFound.controller.js";

const router = express.Router();

router.get("/found/pending", authenticate, getPendingFoundItems);
router.patch("/found/:id/approve", authenticate, approveFoundItem);
router.patch("/found/:id/reject", authenticate, rejectFoundItem);
router.patch("/found/:id/returned", authenticate, markFoundItemReturned);

export default router;
