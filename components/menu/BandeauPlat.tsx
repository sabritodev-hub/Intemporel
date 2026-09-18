import Image from "next/image";
import { cn, getImageUrl } from "@/lib/utils";

interface BandeauPlatProps {
  image: string | null;
  nom: string;
  available: boolean;
  priority?: boolean;
  sizes?: string;
}

/**
 * Bandeau de tête homogène (ratio 16/10) partagé par PlatCard et PlatModal.
 * Un plat sans photo prend le traitement `plaque` (voir 06-design-system.md,
 * section 5) — jamais de placeholder "photo non disponible".
 */
export default function BandeauPlat({ image, nom, available, priority, sizes }: BandeauPlatProps) {
  const nomLong = nom.length > 22;

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-[#e2dcc0]">
      <div className={cn("h-full w-full", !available && "saturate-[.35]")}>
        {image ? (
          <Image
            src={getImageUrl(image)}
            alt={nom}
            fill
            className="object-cover"
            sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            unoptimized
            priority={priority}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-beige px-6 text-center"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(128,0,32,.055) 0px, rgba(128,0,32,.055) 1px, transparent 1px, transparent 12px)",
            }}
          >
            <span aria-hidden="true" className="h-px w-[26px] bg-[rgba(128,0,32,.35)]" />
            <p
              className={cn(
                "font-playfair font-semibold text-bordeaux",
                nomLong ? "text-xl" : "text-2xl",
              )}
            >
              {nom}
            </p>
            <p className="font-montserrat text-[9.5px] uppercase tracking-[.22em] text-bordeaux-light">
              Spécialité maison
            </p>
            <span aria-hidden="true" className="h-px w-[26px] bg-[rgba(128,0,32,.35)]" />
          </div>
        )}
      </div>

      {!available && (
        <span className="absolute left-3 top-3 rounded-full bg-bordeaux px-3 py-1 font-montserrat text-xs font-semibold uppercase tracking-wide text-beige-light">
          Épuisé
        </span>
      )}
    </div>
  );
}
