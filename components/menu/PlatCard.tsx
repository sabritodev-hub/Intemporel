'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { Plat, Category } from '@/types/database.types'

interface PlatCardProps {
  plat: Plat & { categories: Category }
  onClick: () => void
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
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getImageUrl(plat.image)}
          alt={plat.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {!plat.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-bordeaux px-4 py-2 font-montserrat text-sm font-semibold text-white">
              Indisponible
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
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
  )
}
