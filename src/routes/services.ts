import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

export default router;
