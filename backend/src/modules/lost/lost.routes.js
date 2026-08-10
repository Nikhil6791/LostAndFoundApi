import express from "express";

import authenticate from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";

import { createLostItemValidation } from "./lost.validation.js";
import { createLostItem } from "./lost.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  createLostItemValidation,
  validate,
  createLostItem,
);

export default router;
