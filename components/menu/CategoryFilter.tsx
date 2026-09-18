"use client";

import { cn } from "@/lib/utils";
import { Category } from "@/types/database.types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-[60px] z-30 flex gap-2 overflow-x-auto whitespace-nowrap bg-beige-light py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "min-h-[44px] flex-none rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors duration-300",
          selectedCategory === null
            ? "bg-bordeaux text-beige-light"
            : "border border-bordeaux/[.22] bg-transparent text-bordeaux",
        )}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className={cn(
            "min-h-[44px] flex-none rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors duration-300",
            selectedCategory === category.slug
              ? "bg-bordeaux text-beige-light"
              : "border border-bordeaux/[.22] bg-transparent text-bordeaux",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
