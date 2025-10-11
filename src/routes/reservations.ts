// src/routes/reservations.ts
import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

/**
 * POST /api/reservations
 * body {
 *  name, phone, email, cpf,
 *  date: ISO string,
 *  time: "14:30",
 *  barberId: number | string | null,
 *  services: [1,2,3] // ids de services (numbers or strings)
 * }
 */
router.post("/", async (req, res) => {
    try {
        console.log("Recebido body:", req.body); // log do body enviado

        const { name, phone, email, cpf, date, time, barberId, services } = req.body;

        if (!name || !phone || !email || !cpf || !date || !time) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }

        // upsert cliente por CPF
        const client = await prisma.client.upsert({
            where: { cpf },
            update: { name, phone, email },
            create: { name, phone, email, cpf },
        });
        console.log("Cliente upsertado:", client);

        const serviceIds: number[] = (services || []).map((s: any) => Number(s)).filter(Boolean);

        // validação extra: serviços existem mesmo?
        const serviceRecords = serviceIds.length
            ? await prisma.service.findMany({ where: { id: { in: serviceIds } } })
            : [];
        console.log("Serviços encontrados:", serviceRecords);

        const totalPrice = serviceRecords.reduce((sum: number, s: { price: string }) => sum + Number(s.price), 0);

        const reservation = await prisma.reservation.create({
            data: {
                clientId: client.id,
                barberId: barberId ? Number(barberId) : null,
                date: new Date(date),
                time,
                totalPrice,
                services: {
                    create: serviceIds.map((serviceId) => ({ serviceId })),
                },
            },
            include: {
                client: true,
                barber: true,
                services: { include: { service: true } },
            },
        });

        console.log("Reserva criada:", reservation);
        res.status(201).json(reservation);

    } catch (error) {
        console.error("POST /api/reservations error detalhado:", error);
        res.status(500).json({ error: "Erro ao criar reserva" });
    }
});

// GET /api/reservations
router.get("/", async (req, res) => {
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
