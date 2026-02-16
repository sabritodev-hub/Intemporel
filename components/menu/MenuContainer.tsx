'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import CategoryFilter from './CategoryFilter'
import PlatCard from './PlatCard'
import PlatModal from './PlatModal'
import { Category, Plat, Option, OptionType } from '@/types/database.types'

interface PlatWithRelations extends Plat {
  categories: Category
  plat_options: {
    options: Option & {
      option_types: OptionType
    }
  }[]
}

interface MenuContainerProps {
  categories: Category[]
  plats: PlatWithRelations[]
}

export default function MenuContainer({ categories, plats }: MenuContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPlat, setSelectedPlat] = useState<PlatWithRelations | null>(null)

  const filteredPlats = useMemo(() => {
    if (!selectedCategory) return plats
    return plats.filter((plat) => plat.categories?.slug === selectedCategory)
  }, [plats, selectedCategory])

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="font-playfair text-4xl font-bold text-bordeaux md:text-5xl lg:text-6xl">
          Notre Carte
        </h1>
        <p className="mt-4 font-montserrat text-lg text-bordeaux/70">
          Découvrez nos créations artisanales, préparées avec passion
        </p>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Plats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredPlats.map((plat) => (
            <PlatCard
              key={plat.id}
              plat={plat}
              onClick={() => setSelectedPlat(plat)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPlats.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-playfair text-xl text-bordeaux/70">
            Aucun dessert trouvé dans cette catégorie
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedPlat && (
        <PlatModal
          plat={selectedPlat}
          onClose={() => setSelectedPlat(null)}
        />
      )}
    </div>
  )
}
