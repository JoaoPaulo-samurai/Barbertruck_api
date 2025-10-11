import express from "express";
import cors from "cors";
import barbersRouter from "./routes/barbers";
import servicesRouter from "./routes/services";
import reservationsRouter from "./routes/reservations";

const app = express();

// Configuração CORS para desenvolvimento
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173"], // coloque aqui todas as origens do frontend que estiver usando
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Rotas
app.use("/api/barbers", barbersRouter);
app.use("/api/services", servicesRouter);
app.use("/api/reservations", reservationsRouter);

// Error handler simples
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
