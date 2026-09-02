import asyncHandler from "../../utils/asyncHandler.js";
import { getPotentialMatchesForAdminService } from "../matching/matching.service.js";
import { classifyScore } from "../matching/scoring.js";

export const getPotentialMatches = asyncHandler(async (req, res) => {
  const { matches, pagination } = await getPotentialMatchesForAdminService(req.query);

  const data = matches.map((match) => ({
    id: match.id,
    score: match.score,
    classification: classifyScore(match.score),
    notifiedAt: match.notifiedAt,
    createdAt: match.createdAt,
    lostItem: match.lostItem,
    foundItem: match.foundItem,
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    pagination,
    data,
  });
});
