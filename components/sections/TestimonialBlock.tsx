import { Quote } from "lucide-react";
import type { SegmentTestimonial } from "@/lib/segments";

type Props = { testimonial: SegmentTestimonial };

export function TestimonialBlock({ testimonial }: Props) {
  return (
    <section className="container-page py-16 md:py-20">
      <figure className="mx-auto max-w-3xl rounded-2xl bg-primary-600 text-white p-8 md:p-12 shadow-card">
        <Quote className="h-10 w-10 text-accent-300 mb-4" aria-hidden />
        <blockquote className="font-display text-2xl md:text-3xl font-semibold leading-snug text-balance">
          “{testimonial.text}”
        </blockquote>
        <figcaption className="mt-6 text-sm">
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-white/70">
            {testimonial.role} · {testimonial.city} · {testimonial.segment}
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
