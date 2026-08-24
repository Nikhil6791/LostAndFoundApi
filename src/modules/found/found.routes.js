import express from "express";
import { createFoundItem, getAllFoundItems } from "./found.controller.js";
import upload from "../../middleware/upload.js";
import validate from "../../middleware/validate.js";
import { createFoundItemValidation } from "./found.validation.js";
import { getFoundItemById, updateFoundItem } from "./found.controller.js";
import { deleteFoundItem } from "./found.controller.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Found route is working",
  });
});

router.get("/", getAllFoundItems);
router.get("/:id", getFoundItemById);
router.put("/:id", upload.single("image"), updateFoundItem);

router.delete("/:id", deleteFoundItem);
router.post(
  "/",
  upload.single("image"),
  createFoundItemValidation,
  validate,
  createFoundItem,
);

export default router;
