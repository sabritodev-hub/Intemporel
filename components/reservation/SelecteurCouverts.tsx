"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelecteurCouvertsProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  telephoneAffiche?: string | null;
}

export default function SelecteurCouverts({
  value,
  onChange,
  min = 1,
  max = 12,
  telephoneAffiche,
}: SelecteurCouvertsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Retirer une personne"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux transition-colors",
            "hover:bg-bordeaux hover:text-beige-light disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bordeaux",
          )}
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="min-w-[4ch] text-center">
          <p className="font-playfair text-[26px] font-semibold text-bordeaux">{value}</p>
          <p className="font-montserrat text-xs text-bordeaux/60">
            {value > 1 ? "personnes" : "personne"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Ajouter une personne"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux transition-colors",
            "hover:bg-bordeaux hover:text-beige-light disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bordeaux",
          )}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {value >= max && telephoneAffiche && (
        <div className="rounded-lg bg-bordeaux p-4 text-center">
          <p className="font-montserrat text-sm text-beige-light">
            Plus de {max} personnes ?{" "}
            <a href={`tel:${telephoneAffiche.replace(/\s/g, "")}`} className="font-semibold underline">
              Appelez-nous au {telephoneAffiche}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
