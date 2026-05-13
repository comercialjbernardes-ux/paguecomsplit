import { z } from "zod";
import { segments, REVENUE_RANGES } from "./segments";

const segmentSlugs = segments.map((s) => s.slug) as [string, ...string[]];
const revenueValues = REVENUE_RANGES.map((r) => r.value) as [
  (typeof REVENUE_RANGES)[number]["value"],
  ...(typeof REVENUE_RANGES)[number]["value"][]
];

const whatsappRegex = /^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/;
const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(120, "Nome muito longo");

export const leadSchema = z.object({
  name: nameSchema,
  whatsapp: z
    .string()
    .trim()
    .regex(whatsappRegex, "Informe um WhatsApp valido com DDD"),
  segment: z.enum(segmentSlugs, { message: "Selecione seu segmento" }),
  monthly_revenue_range: z.enum(revenueValues, {
    message: "Selecione uma faixa de faturamento",
  }),
  type: z.literal("cliente"),
  rep: z.string().max(64).optional(),
});

const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

export const diagnosticSchema = z.object({
  name: nameSchema,
  whatsapp: z
    .string()
    .trim()
    .regex(whatsappRegex, "Informe um WhatsApp valido com DDD"),
  cnpj: z
    .string()
    .trim()
    .regex(cnpjRegex, "CNPJ invalido (formato 00.000.000/0000-00)")
    .optional()
    .or(z.literal("")),
  segment: z.enum(segmentSlugs).optional(),
  monthly_revenue_band: z.string().max(32).optional(),
  estimated_monthly_savings: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  type: z.literal("diagnostico"),
  rep: z.string().max(64).optional(),
});

export const representanteSchema = z.object({
  name: nameSchema,
  document: z
    .string()
    .trim()
    .min(11, "CPF/CNPJ invalido")
    .max(18, "CPF/CNPJ invalido"),
  whatsapp: z
    .string()
    .trim()
    .regex(whatsappRegex, "Informe um WhatsApp valido com DDD"),
  email: z.string().trim().email("E-mail invalido"),
  city: z.string().trim().min(2, "Informe sua cidade/UF").max(80),
  profile: z.enum(
    [
      "consultor_tributario",
      "contador",
      "corretor",
      "vendedor_autonomo",
      "outro",
    ],
    { message: "Selecione um perfil" }
  ),
  type: z.literal("representante"),
  rep: z.string().max(64).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type RepresentanteInput = z.infer<typeof representanteSchema>;
export type DiagnosticInput = z.infer<typeof diagnosticSchema>;

export const payloadSchema = z.discriminatedUnion("type", [
  leadSchema,
  representanteSchema,
  diagnosticSchema,
]);

export type LeadPayload = z.infer<typeof payloadSchema>;
