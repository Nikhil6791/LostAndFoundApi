import { body } from "express-validator";

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

  body("email").optional().isEmail().withMessage("Enter a valid email"),

  body("title").trim().notEmpty().withMessage("Title is required"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("locationLost").trim().notEmpty().withMessage("Location is required"),

  body("dateLost").notEmpty().withMessage("Date is required"),
];
