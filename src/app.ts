import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes"; // depois criamos

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // ajuste se usar 3000

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // necessário se usar cookies httpOnly
}));

app.use("/api/auth", authRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

export default app;
