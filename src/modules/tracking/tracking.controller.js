import asyncHandler from "../../utils/asyncHandler.js";
import { trackReportService } from "./tracking.service.js";

export const trackReport = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;
  const report = await trackReportService(trackingId);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: "No report found with this tracking ID",
    });
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});
