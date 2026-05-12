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
    title: "Quem assinou",
    body:
      "O escritório Barcellos Tucunduva Advogados analisou a estrutura do split operado pela SplitTech sobre infraestrutura Cappta e emitiu parecer técnico-tributário sobre o tema.",
  },
  {
    title: "O que o parecer conclui",
    body:
      "Quando a parte do parceiro é separada na origem da transação (antes do dinheiro liquidar na sua conta), ela não compõe a sua receita bruta para fins de Simples Nacional — desde que o parceiro esteja formalmente contratado e identificado.",
  },
  {
    title: "O que isso muda no seu caixa",
    body:
      "Você passa a tributar só a sua margem real. O dinheiro do parceiro nunca entra como sua receita — e nunca entra no seu DAS.",
  },
  {
    title: "O que você precisa fazer",
    body:
      "Manter contrato formal com cada parceiro envolvido na divisão. O parecer cobre a estrutura; o seu contador valida os números do caso concreto.",
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
