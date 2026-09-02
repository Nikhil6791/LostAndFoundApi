import express from "express";
import rateLimit from "express-rate-limit";
import validate from "../../middleware/validate.js";
import { trackReportValidation } from "./tracking.validation.js";
import { trackReport } from "./tracking.controller.js";

const router = express.Router();

// No login gates this endpoint, so it's the one place in the API someone could
// try to enumerate every report by brute-forcing tracking IDs. Capping requests
// per IP makes that impractical without blocking normal use (a person checking
// their own report a few times).
const trackReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tracking requests. Please try again later.",
  },
});

router.get("/track/:trackingId", trackReportLimiter, trackReportValidation, validate, trackReport);

export default router;
