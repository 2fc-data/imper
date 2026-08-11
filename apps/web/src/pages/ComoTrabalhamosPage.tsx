import { useRef } from "react";
import { ETAPAS } from "../lib/landing";
import { m, useInView } from "framer-motion";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";

export default function ComoTrabalhamosPage() {
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, VIEWPORT);

  return (
    <section id="como-trabalhamos" className="py-12 my-16 sm:py-16 sm:my-24 dark:bg-card/60">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Como trabalhamos
        </h2>
        <p className="mt-2 text-muted-foreground">
          Um processo técnico, transparente e com resultado comprovado.
        </p>
        <m.ol
          ref={listRef}
          className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {ETAPAS.map((etapa, index) => (
            <m.li
              key={etapa.title}
              variants={fadeUp}
              className="relative rounded-xl border bg-card p-5"
            >
              <span className="text-3xl font-extrabold text-accent/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-semibold">{etapa.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {etapa.description}
              </p>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  );
}
