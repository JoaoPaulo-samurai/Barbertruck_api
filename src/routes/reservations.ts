// src/routes/reservations.ts
import { Router } from "express";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library"; // <= importa o Decimal correto

const router = Router();

const onlyDigits = (s: string) => String(s || "").replace(/\D/g, "");
const normalizeCpf = (cpf: string) => onlyDigits(cpf).slice(0, 11);
const normalizePhone = (phone: string) => onlyDigits(phone).slice(0, 20);

router.post("/", async (req, res) => {
  try {
    console.log("Recebido body:", req.body);

    let { name, phone, email, cpf, date, time, barberId, services } = req.body as {
      name: string; phone: string; email: string; cpf: string;
      date: string; time: string; barberId?: number | string | null; services: Array<number | string>;
    };

    if (!name || !phone || !email || !cpf || !date || !time) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // normalizações simples
    cpf = normalizeCpf(cpf);
    phone = normalizePhone(phone);
    name = String(name).slice(0, 100);
    email = String(email).slice(0, 100);

    // ids de serviços tipados
    const serviceIds: number[] = Array.isArray(services)
      ? services.map((s) => Number(s)).filter((v) => Number.isInteger(v) && v > 0)
      : [];

    if (serviceIds.length === 0) {
      return res.status(400).json({ error: "Pelo menos um serviço é obrigatório" });
    }

    // valida serviços
    const serviceRecords = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, price: true },
    });
    if (serviceRecords.length !== serviceIds.length) {
      return res.status(400).json({ error: "Um ou mais serviços não existem" });
    }

    // valida barberId (evita FK)
    let barberIdToUse: number | null = null;
    if (barberId !== undefined && barberId !== null && String(barberId).trim() !== "") {
      const parsed = Number(barberId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return res.status(400).json({ error: "barberId inválido" });
      }
      const barber = await prisma.barber.findUnique({ where: { id: parsed } });
      if (!barber) {
        return res.status(400).json({ error: "Barbeiro não encontrado" });
      }
      barberIdToUse = parsed;
    }

    // --------- ⬇️ TIPAGEM AQUI RESOLVE OS 7006/2339 ⬇️ ----------
    type ServiceRow = { id: number; price: Decimal };

    // soma correta usando Decimal (coluna NUMERIC/DECIMAL)
    const totalPrice: Decimal = (serviceRecords as ServiceRow[]).reduce<Decimal>(
      (sum: Decimal, s: ServiceRow) => sum.plus(s.price),
      new Decimal(0)
    );
    // -------------------------------------------------------------

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const client = await tx.client.upsert({
        where: { cpf },
        update: { name, phone, email },
        create: { name, phone, email, cpf },
      });
      console.log("Cliente upsertado:", client);

      const reservation = await tx.reservation.create({
        data: {
          clientId: client.id,
          barberId: barberIdToUse,
          date: new Date(date),
          time,
          totalPrice, // Decimal ok
        },
      });

      await tx.reservationService.createMany({
        data: serviceIds.map((serviceId) => ({
          reservationId: reservation.id,
          serviceId,
        })),
        skipDuplicates: true,
      });

      return tx.reservation.findUnique({
        where: { id: reservation.id },
        include: {
          client: true,
          barber: true,
          services: { include: { service: true } },
        },
      });
    });

    console.log("Reserva criada:", created);
    return res.status(201).json(created);
  } catch (error) {
    console.error("POST /api/reservations error detalhado:", error);
    return res.status(500).json({ error: "Erro ao criar reserva" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { client: true, barber: true, services: { include: { service: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar reservas" });
  }
});

export default router;
