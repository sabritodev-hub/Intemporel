'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Category } from '@/types/database.types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (slug: string | null) => void
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-6">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'rounded-full px-6 py-2 font-montserrat text-sm font-medium transition-all duration-300',
          selectedCategory === null
            ? 'bg-bordeaux text-beige-light shadow-lg'
            : 'bg-beige-darker text-bordeaux hover:bg-bordeaux/10'
        )}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className={cn(
            'rounded-full px-6 py-2 font-montserrat text-sm font-medium transition-all duration-300',
            selectedCategory === category.slug
              ? 'bg-bordeaux text-beige-light shadow-lg'
              : 'bg-beige-darker text-bordeaux hover:bg-bordeaux/10'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
