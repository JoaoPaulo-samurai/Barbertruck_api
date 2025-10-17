import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  // exemplo de horários padrão (9h às 18h)
  const slots: string[] = [];
  for (let h = 9; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  res.json(slots);
});

export default router;
