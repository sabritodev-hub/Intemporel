'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { Plat, Category, Option, OptionType } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface PlatWithOptions extends Plat {
  categories: Category
  plat_options: {
    options: Option & {
      option_types: OptionType
    }
  }[]
}

interface PlatModalProps {
  plat: PlatWithOptions | null
  onClose: () => void
}

export default function PlatModal({ plat, onClose }: PlatModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // Group options by type
  const optionsByType = useMemo(() => {
    if (!plat?.plat_options) return {}

    const grouped: Record<string, { type: OptionType; options: (Option & { option_types: OptionType })[] }> = {}

    plat.plat_options.forEach(({ options }) => {
      const typeId = options.option_types.id
      if (!grouped[typeId]) {
        grouped[typeId] = {
          type: options.option_types,
          options: [],
        }
      }
      grouped[typeId].options.push(options)
    })

    return grouped
  }, [plat])

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!plat) return 0

    let total = plat.price

    plat.plat_options?.forEach(({ options }) => {
      if (selectedOptions.includes(options.id) && options.price_modifier) {
        total += options.price_modifier
      }
    })

    return total
  }, [plat, selectedOptions])

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    )
  }

  if (!plat) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-beige-light shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-beige-light/90 p-2 text-bordeaux shadow-md backdrop-blur-sm hover:bg-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="max-h-[90vh] overflow-y-auto">
            {/* Image */}
            <div className="relative aspect-video">
              <Image
                src={getImageUrl(plat.image)}
                alt={plat.name}
                fill
                className="object-cover"
                priority
              />
              {!plat.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-bordeaux px-6 py-3 font-montserrat text-lg font-semibold text-white">
                    Indisponible
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <span className="inline-block rounded-full bg-bordeaux/10 px-3 py-1 font-montserrat text-xs font-medium text-bordeaux">
                {plat.categories?.name}
              </span>

              <h2 className="mt-3 font-playfair text-3xl font-bold text-bordeaux">
                {plat.name}
              </h2>

              {plat.description && (
                <p className="mt-2 font-montserrat text-bordeaux/70">
                  {plat.description}
                </p>
              )}

              {/* Options */}
              {Object.keys(optionsByType).length > 0 && (
                <div className="mt-6 space-y-6">
                  <h3 className="font-playfair text-xl font-semibold text-bordeaux">
                    Personnalisez votre dessert
                  </h3>

                  {Object.values(optionsByType).map(({ type, options }) => (
                    <div key={type.id} className="space-y-3">
                      <h4 className="font-montserrat font-medium text-bordeaux">
                        {type.name}
                      </h4>
                      <div className="grid gap-2">
                        {options.map((option) => (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-bordeaux/20 bg-white p-3 hover:border-bordeaux/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedOptions.includes(option.id)}
                                onCheckedChange={() => toggleOption(option.id)}
                              />
                              <span className="font-montserrat text-bordeaux">
                                {option.name}
                              </span>
                            </div>
                            {option.price_modifier && option.price_modifier > 0 && (
                              <span className="font-montserrat text-sm text-bordeaux/70">
                                +{formatPrice(option.price_modifier)}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price and CTA */}
              <div className="mt-8 flex items-center justify-between border-t border-bordeaux/10 pt-6">
                <div>
                  <span className="font-montserrat text-sm text-bordeaux/70">
                    Prix total
                  </span>
                  <p className="font-playfair text-3xl font-bold text-bordeaux">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
                <Button
                  size="lg"
                  disabled={!plat.available}
                  className="font-montserrat"
                >
                  {plat.available ? 'Voir au comptoir' : 'Indisponible'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
