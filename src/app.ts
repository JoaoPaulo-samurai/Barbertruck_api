import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Rotas de teste
app.get("/", (req, res) => {
  res.send("API BarberBookings funcionando 🚀");
});

export default app;
