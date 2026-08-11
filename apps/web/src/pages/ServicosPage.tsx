import { useRef } from "react";
import { m, useInView } from "framer-motion";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";
import { useServicos } from "../lib/useServicos";

export default function ServicosPage() {
  const { servicos, loading, error } = useServicos();
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, VIEWPORT);

  return (
    <section id="servicos" className="bg-background py-12 my-16 sm:py-16 sm:my-24 dark:bg-card/60">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Nossas especialidades
        </h2>
        <p className="mt-2 text-muted-foreground">
          Soluções de engenharia para cada tipo de exposição à água e à
          umidade.
        </p>
        <m.div
          ref={gridRef}
          className="mt-8 grid gap-4 sm:grid-cols-2"
          variants={stagger()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 h-10 w-10 animate-pulse rounded-lg bg-accent/20" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-accent/20" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-accent/20" />
              </div>
            ))}
          {!loading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && servicos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço disponível no momento.
            </p>
          )}
          {!loading &&
            servicos.map((servico) => (
              <m.div
                key={servico.id}
                variants={fadeUp}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d={servico.icone} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">{servico.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {servico.descricao}
                </p>
              </m.div>
            ))}
        </m.div>
      </div>
    </section>
  );
}
