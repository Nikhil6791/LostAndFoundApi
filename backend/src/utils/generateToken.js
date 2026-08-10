import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
console.log("Access:", process.env.JWT_ACCESS_TOKEN_SECRET);
console.log("Refresh:", process.env.JWT_REFRESH_TOKEN_SECRET);
console.log(process.env.DATABASE_URL)
export const generateAccessToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
            email: admin.email,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

export const generateRefreshToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};