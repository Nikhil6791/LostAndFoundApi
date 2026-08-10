import { body } from "express-validator";

export const createLostItemValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("locationLost")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("dateLost")
    .notEmpty()
    .withMessage("Date is required"),
];