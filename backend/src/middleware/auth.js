import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Token Missing",
      });
    }
    console.log("SECRET:", process.env.JWT_ACCESS_TOKEN_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default authenticate;
