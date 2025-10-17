import express from "express";
import cors from "cors";
import reservationsRouter from "./routes/reservations";
import barbersRoute from "./routes/barbers";
import servicesRoute from "./routes/services";
import timeslotsRoute from "./routes/timeslots";



const app = express();

// Configuração CORS para desenvolvimento
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://172.16.2.138:8080" // 🔥 adiciona seu IP local
  ],
  credentials: true
}));


// Parse JSON
app.use(express.json());
app.use("/api/reservations", reservationsRouter);
app.use("/api/barbers", barbersRoute);
app.use("/api/services", servicesRoute);
app.use("/api/timeslots", timeslotsRoute);

// Error handler simples
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
