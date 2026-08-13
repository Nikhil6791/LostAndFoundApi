import express from "express";
import { createFoundItem, getAllFoundItems } from "./found.controller.js";
import authenticate from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";
import {
    getFoundItemById,
    updateFoundItem,
} from "./found.controller.js";
import { deleteFoundItem } from "./found.controller.js";

console.log("🔥 FOUND ROUTES FILE LOADED");

const router = express.Router();

router.get("/test", (req, res) => {
    console.log("🔥 GET /api/found/test HIT");

    res.json({
        success: true,
        message: "Found route is working"
    });
});

router.get("/", getAllFoundItems);
router.get("/:id", getFoundItemById);
router.put(
    "/:id",
    authenticate,
    upload.single("image"),
    updateFoundItem
);

router.delete(
    "/:id",
    authenticate,
    deleteFoundItem
);
router.post("/", authenticate, upload.single("image"), createFoundItem);

export default router;