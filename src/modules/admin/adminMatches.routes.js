import express from "express";
import authenticate from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { getPotentialMatchesValidation } from "./adminMatches.validation.js";
import { getPotentialMatches } from "./adminMatches.controller.js";

const router = express.Router();

router.get("/", authenticate, getPotentialMatchesValidation, validate, getPotentialMatches);

export default router;
