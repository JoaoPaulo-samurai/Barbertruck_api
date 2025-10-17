import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany();
    res.json(barbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar barbeiros" });
  }
});

export default router;
