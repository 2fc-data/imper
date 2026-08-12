import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { WhatsAppButton } from "./WhatsAppButton";
import { fadeUp, stagger } from "../../lib/motion";
import heroBg from "../../assets/Hero_Imper_optimized.webp";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative mx-auto w-full max-w-[1400px] overflow-hidden border-x border-b bg-background"
    >
      <m.img
        src={heroBg}
        alt="Imperpoços engenharia em impermeabilização"
        loading="eager"
        className="block w-full object-cover rounded-sm opacity-75 dark:opacity-75"
        variants={stagger(0.12)}
        initial="hidden"
        animate="visible"
      />
      <div aria-hidden="true" className="absolute inset-0" />
      <m.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 sm:flex-row sm:items-center sm:justify-center"
        variants={stagger(0.12)}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={fadeUp} className="w-full max-w-xs sm:w-auto sm:max-w-none">
          <WhatsAppButton className="w-full justify-center px-6 py-3.5 text-base sm:text-lg sm:w-auto">
            WhatsApp
          </WhatsAppButton>
        </m.div>
        <m.div variants={fadeUp} className="w-full max-w-xs sm:w-auto sm:max-w-none">
          <Link
            to="/orcamento"
            className="flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-base sm:text-lg font-semibold transition-colors
            hover:text-foreground hover:bg-background/90 bg-accent text-accent-foreground
            dark:text-white dark:bg-background/80 dark:hover:bg-accent/20 dark:hover:text-foreground sm:w-auto"
          >
            Formulário Atendimento
          </Link>
        </m.div>
        <m.div variants={fadeUp} className="w-full max-w-xs sm:w-auto sm:max-w-none">
          <Link
            to="/servicos"
            className="flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-base sm:text-lg font-semibold transition-colors
            hover:text-foreground hover:bg-background/90 bg-accent text-accent-foreground
            dark:text-white dark:bg-background/80 dark:hover:bg-accent/20 dark:hover:text-foreground sm:w-auto"
          >
            Nossos Serviços
          </Link>
        </m.div>
      </m.div>
    </section>
  );
}
