import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Token não fornecido" });

  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
