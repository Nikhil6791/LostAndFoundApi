import express from "express";
import { createFoundItem, getAllFoundItems } from "./found.controller.js";
import upload from "../../middleware/upload.js";
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
router.post("/", upload.single("image"), createFoundItem);

export default router;
