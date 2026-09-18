"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Plat, Category } from "@/types/database.types";
import BandeauPlat from "./BandeauPlat";

interface PlatCardProps {
  plat: Plat & { categories: Category };
  onClick: () => void;
}

export default function PlatCard({ plat, onClick }: PlatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        <BandeauPlat image={plat.image} nom={plat.name} available={plat.available} />
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-beige-light/90 px-3 py-1 font-montserrat text-xs font-medium text-bordeaux backdrop-blur-sm">
            {plat.categories?.name}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-playfair text-lg font-semibold text-bordeaux line-clamp-1">
          {plat.name}
        </h3>
        {plat.description && (
          <p className="mt-1 font-montserrat text-sm text-bordeaux/70 line-clamp-2">
            {plat.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-playfair text-xl font-bold text-bordeaux">
            {formatPrice(plat.price)}
          </span>
          <span className="font-montserrat text-xs text-bordeaux/50 group-hover:text-bordeaux transition-colors">
            Voir les options →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
