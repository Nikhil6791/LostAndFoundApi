import { body, query } from "express-validator";

export const createLostItemValidation = [
  body("reporterName")
    .trim()
    .notEmpty()
    .withMessage("Reporter name is required"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Enter a valid phone number"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email"),

  body("title").trim().notEmpty().withMessage("Title is required"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("locationLost").trim().notEmpty().withMessage("Location is required"),

  body("dateLost").notEmpty().withMessage("Date is required"),
];

export const getLostItemsValidation = [
  query("search").optional().trim().isLength({ max: 100 }).withMessage("Search term is too long"),

  query("category").optional().trim().isLength({ max: 50 }).withMessage("Invalid category"),

  query("location").optional().trim().isLength({ max: 100 }).withMessage("Invalid location"),

  query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in YYYY-MM-DD format"),

  query("status")
    .optional()
    .isIn(["ACTIVE", "RETURNED"])
    .withMessage("Status must be ACTIVE or RETURNED"),

  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];
