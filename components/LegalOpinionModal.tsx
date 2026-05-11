"use client";

import { useState } from "react";
import { FileText, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SUMMARY_POINTS = [
  {
    title: "O que é",
    body:
      "Parecer técnico emitido pelo escritório Barcellos Tucunduva Advogados sobre a estrutura jurídica e tributária do split de pagamento operado pela SplitTech (infraestrutura Cappta).",
  },
  {
    title: "O que o parecer fundamenta",
    body:
      "Que o repasse direto a terceiros via split, antes da liquidação na conta do estabelecimento, não compõe a receita bruta do contribuinte para fins de apuração do Simples Nacional, desde que o terceiro seja parte contratada e identificada.",
  },
  {
    title: "Por que isso importa",
    body:
      "Você só tributa o que efetivamente é seu. O valor que pertence a parceiros, autônomos e fornecedores cai direto na conta deles — fora do seu DAS.",
  },
  {
    title: "Limites e responsabilidades",
    body:
      "O parecer pressupõe contratos formais com cada terceiro e segregação consistente dos valores. Não substitui a análise do seu contador para o caso concreto.",
  },
];

export function LegalOpinionModal({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "inline-flex items-center gap-2 text-sm font-semibold text-primary-600 underline-offset-4 hover:underline"
          }
        >
          <FileText className="h-4 w-4" aria-hidden />
          Ver resumo do parecer
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent-600 mb-2">
            <Scale className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Parecer Jurídico
            </span>
          </div>
          <DialogTitle>Resumo do parecer Barcellos Tucunduva</DialogTitle>
          <DialogDescription>
            Linguagem simples. O parecer completo está disponível mediante
            solicitação no WhatsApp comercial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {SUMMARY_POINTS.map((p) => (
            <div key={p.title} className="rounded-lg border border-slate-100 bg-bg p-4">
              <h3 className="font-display text-sm font-bold text-primary-600 mb-1">
                {p.title}
              </h3>
              <p className="text-sm text-text/80 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted mt-2 pt-4 border-t border-slate-100">
          Conteúdo informativo, sumarizado a partir do parecer original. Para a
          versão integral, consulte o time comercial da SplitTech.
        </p>
      </DialogContent>
    </Dialog>
  );
}
