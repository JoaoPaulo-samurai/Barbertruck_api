import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // ajuste expiracao
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
