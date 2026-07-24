import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

const DUMMY_HASH =
  "$2b$12$invalidhashtopreventtimingattacks00000000000000000000";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Payload inválido." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "E-mail ou senha inválidos." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, email, name, role, password_hash, rep_code, whatsapp
      FROM pcs_users
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    const user = rows[0];

    // Compare em tempo constante — mesmo se o usuário não existir
    const hashToCompare = user?.password_hash ?? DUMMY_HASH;
    const valid = await verifyPassword(password, hashToCompare as string);

    if (!user || !valid) {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id as number,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
    });

    const response = NextResponse.json({
      success: true,
      name: user.name,
      role: user.role,
    });

    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno. Tente novamente em instantes.",
      },
      { status: 500 }
    );
  }
}
