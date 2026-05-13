export function NarrativaPonte() {
  return (
    <section
      aria-label="Introdução em tom de conversa"
      className="bg-bg border-b border-slate-100"
    >
      <div className="container-page py-10 md:py-12">
        <p className="max-w-3xl font-display text-xl md:text-2xl text-text leading-snug text-pretty">
          Você não percebe, mas todo mês paga imposto sobre a{" "}
          <strong className="text-warm-500">gorjeta do seu garçom</strong>,
          sobre a <strong className="text-warm-500">peça que o seu mecânico instala</strong>,
          sobre a{" "}
          <strong className="text-warm-500">hora do veterinário parceiro</strong>.
          A SplitTech separa cada parte{" "}
          <span className="underline decoration-accent-500 decoration-2 underline-offset-4">
            antes
          </span>{" "}
          de virar receita sua.
        </p>
      </div>
    </section>
  );
}
