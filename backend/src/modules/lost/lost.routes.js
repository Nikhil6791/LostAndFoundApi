import express from "express";

import authenticate from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";

import { createLostItemValidation } from "./lost.validation.js";
import { createLostItem } from "./lost.controller.js";
import { getAllLostItems } from "./lost.controller.js";
import { getLostItemById } from "./lost.controller.js";
import { updateLostItem } from "./lost.controller.js";
import {
    deleteLostItem
} from "./lost.controller.js";

const router = express.Router();
router.get("/", getAllLostItems);
router.get("/:id", getLostItemById);
router.post(
  "/report",
  upload.single("image"),
  createLostItemValidation,
  validate,
  createLostItem,
);

router.put("/:id", authenticate, upload.single("image"), updateLostItem);
router.delete(
    "/:id",
    authenticate,
    deleteLostItem
);

export default router;
