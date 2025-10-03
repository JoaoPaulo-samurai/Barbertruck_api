import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { signAccessToken } from "../../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email e senha são obrigatórios" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email já cadastrado" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || "client" } });

  res.status(201).json({ id: user.id, email: user.email, name: user.name });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email e senha são obrigatórios" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

  const token = signAccessToken({ userId: user.id, role: user.role, email: user.email });

  // devolve token no body (simples) — frontend armazena e envia no header Authorization
  res.json({
    accessToken: token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req: Request, res: Response) {
  // authMiddleware já colocou req.user
  const user = (req as any).user;
  res.json({ user });
}
