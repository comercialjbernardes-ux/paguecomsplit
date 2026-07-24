import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Senha deve ter ao menos uma letra maiúscula.";
  if (!/[0-9]/.test(password)) return "Senha deve ter ao menos um número.";
  return null;
}
