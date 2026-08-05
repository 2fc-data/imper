import { useRef } from "react";
import { Link } from "react-router-dom";
import { WHATSAPP_TEXT, WHATSAPP_URL } from "../lib/landing";
import { m, useInView } from "framer-motion";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";

export default function ContatoPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, VIEWPORT);

  return (
    <section id="contato" className="bg-card/60 py-12 my-16 sm:py-16 sm:my-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Entre em contato conosco
        </h2>
        <p className="mt-2 text-muted-foreground">
          Saiba sobre o melhor sistema impermeabilizante para a sua obra.
        </p>
        <m.div
          ref={cardRef}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="mt-8 overflow-hidden rounded-2xl bg-primary text-primary-foreground"
        >
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Canais de atendimento
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              Solicite uma visita técnica, um orçamento ou tire dúvidas sobre nossos serviços.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  WhatsApp
                </p>
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(WHATSAPP_TEXT)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-semibold text-secondary hover:underline"
                >
                  (35) 99999-4663
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  Telefone
                </p>
                <a
                  href="tel:+553537211674"
                  className="mt-1 block font-semibold text-secondary hover:underline"
                >
                  (35) 3721-1674
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  E-mail
                </p>
                <a
                  href="mailto:impershop@imperpocos.com.br"
                  className="mt-1 block break-all font-semibold text-secondary hover:underline"
                >
                  impershop@imperpocos.com.br
                </a>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/orcamento"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                Orçamento online
              </Link>
            </div>
          </div>
        </m.div>

        <m.div
          className="mt-8 grid gap-4 sm:grid-cols-2"
          variants={stagger()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <m.div variants={fadeUp} className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-accent"
                aria-hidden="true"
              >
                <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              Endereço
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Rua São Paulo, 511 — Centro
              <br />
              Poços de Caldas/MG
            </p>
          </m.div>
          <m.div variants={fadeUp} className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-accent"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              Horário de atendimento
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Segunda a sexta-feira
              <br />
              07h15 às 12h e 13h às 17h
            </p>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
