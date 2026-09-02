import { param } from "express-validator";

// Reject obviously-malformed IDs before they ever reach the database — also
// means someone probing random strings gets a cheap 400, not a query per guess.
export const trackReportValidation = [
  param("trackingId")
    .trim()
    .matches(/^LF-\d{4}-\d{5}$/)
    .withMessage("Invalid tracking ID format"),
];
