/**
 * Endpoint de setup inicial — cria a tabela e o primeiro usuário admin.
 * Protegido pela variável de ambiente SETUP_KEY.
 *
 * Uso (uma única vez após deploy):
 *   POST /api/auth/setup
 *   Body: { setupKey, name, email, password }
 *
 * Após criar o primeiro usuário, remova ou desabilite este endpoint
 * apagando a SETUP_KEY do painel Netlify.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, DB_SCHEMA } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const setupSchema = z.object({
  setupKey: z.string().min(1),
  name: z.string().trim().min(2, "Nome obrigatório."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "Senha mínimo 8 caracteres."),
  role: z
    .enum(["admin", "representante", "cliente"])
    .optional()
    .default("representante"),
});

export async function POST(req: Request) {
  const SETUP_KEY = process.env.SETUP_KEY;
  if (!SETUP_KEY) {
    return NextResponse.json(
      { success: false, message: "Setup desabilitado (SETUP_KEY não configurada)." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Payload inválido." }, { status: 400 });
  }

  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Dados inválidos.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { setupKey, name, email, password, role } = parsed.data;

  if (setupKey !== SETUP_KEY) {
    return NextResponse.json(
      { success: false, message: "Chave de setup incorreta." },
      { status: 403 }
    );
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ success: false, message: passwordError }, { status: 400 });
  }

  try {
    const sql = getDb();

    // Cria a tabela se não existir
    await sql(DB_SCHEMA);

    const passwordHash = await hashPassword(password);

    const existing = await sql`
      SELECT id FROM pcs_users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    const [user] = await sql`
      INSERT INTO pcs_users (email, password_hash, name, role)
      VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${name.trim()}, ${role})
      RETURNING id, email, name, role
    `;

    return NextResponse.json({
      success: true,
      message: `Usuário "${user.name}" criado com sucesso.`,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("[auth/setup]", err);
    return NextResponse.json(
      { success: false, message: "Erro ao criar usuário. Verifique DATABASE_URL." },
      { status: 500 }
    );
  }
}
