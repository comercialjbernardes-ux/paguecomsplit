import { NextResponse } from "next/server";
import { payloadSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Payload invalido (JSON malformado)." },
      { status: 400 }
    );
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Verifique os campos e tente novamente.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const lead = {
    ...parsed.data,
    received_at: new Date().toISOString(),
    source: "paguecomsplit.com.br",
    user_agent: req.headers.get("user-agent") ?? null,
    referer: req.headers.get("referer") ?? null,
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const token = process.env.LEAD_WEBHOOK_TOKEN;

  if (!webhook) {
    // Dev fallback: log para inspecionar enquanto o webhook nao esta configurado.
    console.warn("[lead] webhook nao configurado — payload em log:", lead);
    return NextResponse.json({
      success: true,
      message: "Lead recebido (modo desenvolvimento, sem webhook configurado).",
    });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Webhook-Token": token } : {}),
      },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[lead] webhook respondeu nao-OK:", res.status, text);
      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível registrar agora. Tente novamente em instantes.",
        },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[lead] erro ao chamar webhook:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Falha temporária ao registrar. Por favor, use o WhatsApp.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Lead registrado com sucesso.",
  });
}
