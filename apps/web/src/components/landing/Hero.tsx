import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { WhatsAppButton } from "./WhatsAppButton";
import { fadeUp, stagger } from "../../lib/motion";
import heroBg from "../../assets/Hero_Imper_optimized.webp";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative mx-auto w-full max-w-[1400px] overflow-hidden border-x border-b bg-white dark:bg-background"
    >
      <m.img
        src={heroBg}
        alt="Imperpoços engenharia em impermeabilização"
        loading="eager"
        className="block w-full object-cover transition-opacity dark:opacity-70"
        variants={stagger(0.12)}
        initial="hidden"
        animate="visible"
      />
      <m.div
        className="absolute inset-0 flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-center"
        variants={stagger(0.12)}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={fadeUp}>
          <WhatsAppButton className="px-6 py-3.5 text-lg">
            Orçamento
          </WhatsAppButton>
        </m.div>
        <m.div variants={fadeUp}>
          <Link
            to="/orcamento"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-lg font-semibold transition-colors
            text-black bg-white/84 hover:bg-accent/84 hover:text-accent-foreground
            dark:text-white dark:bg-background/80 dark:hover:bg-accent/20 dark:hover:text-foreground"
          >
            Orçamento online
          </Link>
        </m.div>
        <m.div variants={fadeUp}>
          <Link
            to="/servicos"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-lg font-semibold transition-colors
            text-black bg-white/84 hover:bg-accent/84 hover:text-accent-foreground
            dark:text-white dark:bg-background/80 dark:hover:bg-accent/20 dark:hover:text-foreground"
          >
            Conhecer serviços
          </Link>
        </m.div>
      </m.div>
    </section>
  );
}
