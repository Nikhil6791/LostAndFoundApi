import { body } from "express-validator";

export const createFoundItemValidation = [
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

  body("locationFound").trim().notEmpty().withMessage("Location is required"),

  body("dateFound").notEmpty().withMessage("Date is required"),
];
