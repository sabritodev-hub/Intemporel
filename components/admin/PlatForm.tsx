'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import ImageUpload from './ImageUpload'
import { createPlat, updatePlat } from '@/app/actions'
import { Category, Plat, Option, OptionType } from '@/types/database.types'

const platSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  category_id: z.string().min(1, 'La catégorie est requise'),
  available: z.boolean(),
})

type PlatFormData = z.infer<typeof platSchema>

interface OptionWithType extends Option {
  option_types: OptionType
}

interface PlatFormProps {
  plat?: Plat & { plat_options?: { option_id: string }[] }
  categories: Category[]
  options: OptionWithType[]
}

export default function PlatForm({ plat, categories, options }: PlatFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<string | null>(plat?.image || null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    plat?.plat_options?.map((po) => po.option_id) || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlatFormData>({
    resolver: zodResolver(platSchema),
    defaultValues: {
      name: plat?.name || '',
      description: plat?.description || '',
      price: plat?.price || 0,
      category_id: plat?.category_id || '',
      available: plat?.available ?? true,
    },
  })

  const available = watch('available')

  // Group options by type
  const optionsByType: Record<string, { type: OptionType; options: OptionWithType[] }> = {}
  options.forEach((option) => {
    const typeId = option.option_types.id
    if (!optionsByType[typeId]) {
      optionsByType[typeId] = {
        type: option.option_types,
        options: [],
      }
    }
    optionsByType[typeId].options.push(option)
  })

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    )
  }

  const onSubmit = async (data: PlatFormData) => {
    setIsLoading(true)

    try {
      const platData = {
        ...data,
        image,
        option_ids: selectedOptions,
      }

      const result = plat
        ? await updatePlat(plat.id, platData)
        : await createPlat(platData)

      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Succès',
        description: plat ? 'Plat mis à jour' : 'Plat créé',
      })

      router.push('/admin/plats')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Basic info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du plat</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Tiramisu" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Une description appétissante..."
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="available"
              checked={available}
              onCheckedChange={(checked) => setValue('available', checked)}
            />
            <Label htmlFor="available">
              {available ? 'Disponible' : 'Indisponible'}
            </Label>
          </div>
        </div>

        {/* Right column - Image */}
        <div className="space-y-2">
          <Label>Photo du plat</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
      </div>

      {/* Options */}
      {Object.keys(optionsByType).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-playfair text-lg font-semibold text-bordeaux">
            Options disponibles
          </h3>
          <p className="text-sm text-bordeaux/70">
            Sélectionnez les options disponibles pour ce plat
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(optionsByType).map(({ type, options: typeOptions }) => (
              <div key={type.id} className="rounded-lg border border-bordeaux/20 p-4">
                <h4 className="mb-3 font-montserrat font-medium text-bordeaux">
                  {type.name}
                </h4>
                <div className="space-y-2">
                  {typeOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Checkbox
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                      <span className="text-sm text-bordeaux">
                        {option.name}
                        {option.price_modifier && option.price_modifier > 0 && (
                          <span className="text-bordeaux/50">
                            {' '}(+{option.price_modifier.toFixed(2)}€)
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : plat ? 'Mettre à jour' : 'Créer le plat'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
