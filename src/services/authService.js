import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

export const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return admin;
};
