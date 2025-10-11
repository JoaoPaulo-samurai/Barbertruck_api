// src/routes/barbers.ts
import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/barbers
router.get("/", async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany();
    res.json(barbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar barbeiros" });
  }
});

export default router;
