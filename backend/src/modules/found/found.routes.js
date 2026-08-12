import express from "express";
import { createFoundItem } from "./found.controller.js";
import authenticate  from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    upload.single("image"),
    createFoundItem
);

export default router;