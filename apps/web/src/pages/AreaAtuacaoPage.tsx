import { useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { m, useInView } from "framer-motion";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";
import { useCidades } from "../lib/useCidades";
import heroBg from "../assets/Hero_Imper_optimized.webp";
import "leaflet/dist/leaflet.css";

const COR_MARCADOR = "oklch(70% 0.14 227)";

function createMarcador() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${COR_MARCADOR};border:3px solid var(--marker-ring);box-shadow:0 2px 6px rgb(0 0 0 / 0.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
}

export default function AreaAtuacaoPage() {
  const { cidades, loading, error } = useCidades();
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(listRef, VIEWPORT);

  const marcador = useMemo(() => createMarcador(), []);

  const pontos = useMemo(
    () =>
      cidades.map((c) => ({
        id: c.id,
        nome: c.nome,
        uf: c.uf,
        lat: Number(c.lat),
        lng: Number(c.lng),
      })),
    [cidades],
  );

  const bounds: L.LatLngBoundsExpression | null = useMemo(() => {
    if (pontos.length === 0) return null;
    if (pontos.length === 1) {
      return [
        [pontos[0].lat, pontos[0].lng],
        [pontos[0].lat, pontos[0].lng],
      ];
    }
    return L.latLngBounds(pontos.map((p) => [p.lat, p.lng] as [number, number]));
  }, [pontos]);

  return (
    <section id="area-de-atuacao" className="bg-background py-12 my-16 sm:py-16 sm:my-24 dark:bg-card/60">
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Área de atuação
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Atendemos Poços de Caldas e Região.
        </p>
        <m.div
          ref={listRef}
          className="mt-6"
          variants={stagger(0.03)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {loading && (
            <div className="flex h-[360px] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
              Carregando mapa...
            </div>
          )}
          {!loading && error && (
            <div className="flex h-[360px] items-center justify-center rounded-xl border bg-card text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && pontos.length === 0 && (
            <div className="flex h-[360px] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
              Nenhuma cidade cadastrada ainda.
            </div>
          )}
          {!loading && !error && pontos.length > 0 && bounds && (
            <m.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-xl border bg-card p-3">
                <MapContainer
                  center={[pontos[0].lat, pontos[0].lng]}
                  zoom={11}
                  scrollWheelZoom={false}
                  className="z-0 h-[360px] w-full rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds bounds={bounds} />
                  {pontos.map((p) => (
                    <Marker
                      key={p.id}
                      position={[p.lat, p.lng]}
                      icon={marcador}
                    >
                      <Popup>
                        <span className="font-medium">
                          {p.nome} - {p.uf}
                        </span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="hidden sm:flex items-center justify-center rounded-xl border bg-card overflow-hidden">
                <img
                  src={heroBg}
                  alt="Imper Pinturas"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            </m.div>
          )}
        </m.div>
      </div>
    </section>
  );
}
