// src/routes/services.ts
import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

export default router;
