import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import lostRoutes from "./modules/lost/lost.routes.js";
import foundRoutes from "./modules/found/found.routes.js";

const app = express();
console.log("Access:", process.env.JWT_ACCESS_SECRET);
console.log("Refresh:", process.env.JWT_REFRESH_SECRET);
app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));
app.use(errorHandler);
app.use("/api/auth", authRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lost & Found API Running 🚀",
  });
});

export default app;
