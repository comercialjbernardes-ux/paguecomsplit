"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type Props = {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
};

/**
 * Renderiza o valor final no HTML do SSR/SSG (importante para SEO — antes
 * o Googlebot indexava "0"). Apos a hidratacao, anima de 0 ate o valor
 * final quando entra no viewport.
 */
export function AnimatedNumber({
  value,
  duration = 1.4,
  format = (v) => Math.round(v).toLocaleString("pt-BR"),
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [current, setCurrent] = useState<number>(value);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Marca quando hidrato no cliente (so depois disso a animacao roda)
  useEffect(() => {
    setHydrated(true);
    setCurrent(0);
  }, []);

  useEffect(() => {
    if (!hydrated || !inView) return;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hydrated, inView, value, duration]);

  // Antes da hidratacao: renderiza o valor final no HTML (SSR-friendly).
  // Apos a hidratacao: usa o `current` que comeca em 0 e anima ate `value`.
  const display = hydrated ? current : value;

  return (
    <span ref={ref} className={className} aria-label={String(Math.round(value))}>
      {format(display)}
    </span>
  );
}
