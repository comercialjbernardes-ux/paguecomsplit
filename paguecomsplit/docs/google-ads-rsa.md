# Google Ads — Copy RSA (Sprint 3)

Configurações obrigatórias todas as campanhas:
- Dayparting: seg-sex 8h–19h
- Budget inicial: R$ 50–100/dia
- Mobile priority (público pesquisa no celular)
- Location: Brasil
- Conversões a rastrear: clique_whatsapp · abertura_popup · submit_popup

---

## CAMPANHA 1 — PROBLEMA (topo de funil)
**Destino:** paguecomsplit.com.br (home)
**Objetivo:** awareness / pesquisa educacional

| Campo | Texto |
|---|---|
| Headline 1 | Pare de Tributar o Repasse do Parceiro |
| Headline 2 | Split de Pagamento no Simples Nacional |
| Headline 3 | Redução de até 50% no DAS — Simule |
| Headline 4 | Maquininha com Cofre Digital — SplitTech |
| Headline 5 | Infra Cappta · Regulado BACEN |
| Description 1 | A SplitTech administra a divisão antes do DAS incidir. Você tributa só a sua margem real. Sem fidelidade. |
| Description 2 | Infraestrutura Cappta · Regulado BACEN · Parecer Barcellos Tucunduva. Simule agora. |

**Keywords (correspondência de frase):**
- "como reduzir imposto simples nacional"
- "bitributação simples nacional"
- "split de pagamento o que é"
- "reduzir das simples nacional"
- "maquininha split pagamento"

---

## CAMPANHA 2 — SEGMENTO (fundo de funil)
**Destino:** LP específica de cada segmento

### Grupo 1 — Estética
**Destino:** paguecomsplit.com.br/estetica

| Campo | Texto |
|---|---|
| Headline 1 | Clínica de Estética: Menos DAS |
| Headline 2 | Receita da Parceira Fora do Seu DAS |
| Headline 3 | Simule a Economia da Sua Clínica |
| Description 1 | Cada profissional parceira eleva seu DAS indevidamente. A SplitTech administra a divisão antes do imposto incidir. |
| Description 2 | Cappta · BACEN · Sem mensalidade · Diagnóstico gratuito em 15 min. |

**Keywords:**
- "maquininha clínica estética imposto"
- "split pagamento estetica simples"
- "como reduzir imposto clínica estética"

### Grupo 2 — Restaurante
**Destino:** paguecomsplit.com.br/restaurante

| Campo | Texto |
|---|---|
| Headline 1 | Restaurante: Gorjeta Fora do DAS |
| Headline 2 | Pare de Pagar Imposto sobre Gorjeta |
| Headline 3 | Simule a Economia do Seu Restaurante |
| Description 1 | Você paga DAS sobre a gorjeta do seu garçom? A SplitTech administra a divisão antes do imposto incidir. |
| Description 2 | Infra Cappta · Regulado BACEN · Diagnóstico gratuito em 15 min. |

**Keywords:**
- "imposto gorjeta restaurante simples"
- "split pagamento restaurante"
- "reduzir das restaurante simples nacional"

### Grupo 3 — Oficina
**Destino:** paguecomsplit.com.br/oficina

| Campo | Texto |
|---|---|
| Headline 1 | Oficina: Peças Fora da Sua Receita |
| Headline 2 | Pare de Tributar Peças Repassadas |
| Headline 3 | Simule a Economia da Sua Oficina |
| Description 1 | As peças que você repassa ao cliente não são sua receita. A SplitTech administra a divisão antes do DAS incidir. |
| Description 2 | Cappta · BACEN · Sem fidelidade · Diagnóstico em 15 min. |

**Keywords:**
- "tributação peças oficina simples"
- "gateway pagamento oficina mecânica"
- "split pagamento oficina simples nacional"

---

## CAMPANHA 3 — CONCORRENTES (destino: home)
**Destino:** paguecomsplit.com.br
**Nota:** verificar política de marca registrada antes de ativar

| Campo | Texto |
|---|---|
| Headline 1 | Alternativa ao Gateway Tradicional |
| Headline 2 | Split Antes do DAS — Simples Nacional |
| Headline 3 | Sem Bitributação — Veja Como Funciona |
| Description 1 | Diferente de gateways convencionais: a divisão é gerida antes do DAS incidir. Você tributa só a sua margem real. |
| Description 2 | Infra Cappta · 14 anos · +R$ 7 bi/ano · Regulado BACEN. Simule grátis. |

**Keywords:**
- "alternativa pagar.me split"
- "gateway pagamento simples nacional"
- "maquininha split pagamento simples"

---

## IDs de conversão (preencher após configurar Google Ads)

```
GOOGLE_ADS_CONVERSION_WHATSAPP=AW-XXXXXXXXXX/YYYYYYYYYY
GOOGLE_ADS_CONVERSION_POPUP=AW-XXXXXXXXXX/ZZZZZZZZZZ
```

Adicionar em `.env.local` e referenciar em `Analytics.tsx` via `gtag('event', 'conversion', ...)`.
