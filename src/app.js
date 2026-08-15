import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import lostRoutes from "./modules/lost/lost.routes.js";
import foundRoutes from "./modules/found/found.routes.js";
import adminFoundRoutes from "./modules/admin/adminFound.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      process.env.USER_FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/admin", adminFoundRoutes);

app.use(errorHandler);
export default app;
