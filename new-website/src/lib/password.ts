import bcrypt from "bcryptjs";

const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain.trim(), ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const normalized = plain.trim();
  if (!normalized || !hash || !/^\$2[aby]\$\d{2}\$/.test(hash)) {
    return false;
  }
  return bcrypt.compare(normalized, hash);
}
