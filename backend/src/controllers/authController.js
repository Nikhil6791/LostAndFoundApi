import asyncHandler from "../utils/asyncHandler.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import { loginAdmin } from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await loginAdmin(email, password);

  const accessToken = generateAccessToken(admin);

  const refreshToken = generateRefreshToken(admin);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
});
