'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  createOptionType,
  updateOptionType,
  deleteOptionType,
  createOption,
  updateOption,
  deleteOption,
} from '@/app/actions'
import { OptionType, Option } from '@/types/database.types'
import { formatPrice } from '@/lib/utils'

interface OptionWithType extends Option {
  option_types: OptionType
}

interface OptionsClientProps {
  optionTypes: OptionType[]
  options: OptionWithType[]
}

export default function OptionsClient({ optionTypes, options }: OptionsClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Option Type state
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false)
  const [editType, setEditType] = useState<OptionType | null>(null)
  const [deleteType, setDeleteType] = useState<OptionType | null>(null)

  // Option state
  const [isCreateOptionOpen, setIsCreateOptionOpen] = useState(false)
  const [editOption, setEditOption] = useState<OptionWithType | null>(null)
  const [deleteOptionTarget, setDeleteOptionTarget] = useState<Option | null>(null)
  const [selectedTypeForOption, setSelectedTypeForOption] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)

  // Group options by type
  const optionsByType: Record<string, OptionWithType[]> = {}
  options.forEach((option) => {
    const typeId = option.option_type_id
    if (!optionsByType[typeId]) {
      optionsByType[typeId] = []
    }
    optionsByType[typeId].push(option)
  })

  // Option Type handlers
  const handleCreateType = async (formData: FormData) => {
    setIsLoading(true)
    const result = await createOptionType(formData)
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Type d\'option créé' })
      setIsCreateTypeOpen(false)
      router.refresh()
    }
  }

  const handleUpdateType = async (formData: FormData) => {
    if (!editType) return
    setIsLoading(true)
    const result = await updateOptionType(editType.id, formData)
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Type d\'option mis à jour' })
      setEditType(null)
      router.refresh()
    }
  }

  const handleDeleteType = async () => {
    if (!deleteType) return
    setIsLoading(true)
    const result = await deleteOptionType(deleteType.id)
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Type d\'option supprimé' })
      setDeleteType(null)
      router.refresh()
    }
  }

  // Option handlers
  const handleCreateOption = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const priceStr = formData.get('price_modifier') as string
    const price_modifier = priceStr ? parseFloat(priceStr) : null

    setIsLoading(true)
    const result = await createOption({
      name,
      price_modifier,
      option_type_id: selectedTypeForOption,
    })
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Option créée' })
      setIsCreateOptionOpen(false)
      setSelectedTypeForOption('')
      router.refresh()
    }
  }

  const handleUpdateOption = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editOption) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const priceStr = formData.get('price_modifier') as string
    const price_modifier = priceStr ? parseFloat(priceStr) : null
    const option_type_id = formData.get('option_type_id') as string

    setIsLoading(true)
    const result = await updateOption(editOption.id, {
      name,
      price_modifier,
      option_type_id,
    })
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Option mise à jour' })
      setEditOption(null)
      router.refresh()
    }
  }

  const handleDeleteOption = async () => {
    if (!deleteOptionTarget) return
    setIsLoading(true)
    const result = await deleteOption(deleteOptionTarget.id)
    setIsLoading(false)

    if (result.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Succès', description: 'Option supprimée' })
      setDeleteOptionTarget(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-bordeaux">
            Options
          </h1>
          <p className="mt-1 font-montserrat text-bordeaux/70">
            Gérez les sauces, tailles, parfums et autres personnalisations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={handleCreateType}>
                <DialogHeader>
                  <DialogTitle>Nouveau type d'option</DialogTitle>
                  <DialogDescription>
                    Ex: Sauce, Taille, Parfum, Garniture...
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type-name">Nom du type</Label>
                    <Input id="type-name" name="name" placeholder="Ex: Sauce" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateTypeOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Création...' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOptionOpen} onOpenChange={setIsCreateOptionOpen}>
            <DialogTrigger asChild>
              <Button disabled={optionTypes.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle option
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateOption}>
                <DialogHeader>
                  <DialogTitle>Nouvelle option</DialogTitle>
                  <DialogDescription>
                    Ajoutez une option de personnalisation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type d'option</Label>
                    <Select value={selectedTypeForOption} onValueChange={setSelectedTypeForOption}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option-name">Nom</Label>
                    <Input id="option-name" name="name" placeholder="Ex: Caramel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option-price">Prix additionnel (€)</Label>
                    <Input
                      id="option-price"
                      name="price_modifier"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00 (gratuit)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOptionOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading || !selectedTypeForOption}>
                    {isLoading ? 'Création...' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Option Types and Options */}
      {optionTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-bordeaux/70">Aucun type d'option pour le moment</p>
            <Button className="mt-4" onClick={() => setIsCreateTypeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer votre premier type d'option
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {optionTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="font-playfair text-xl text-bordeaux">
                  {type.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setEditType(type)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteType(type)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {optionsByType[type.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {optionsByType[type.id].map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between rounded-lg border border-bordeaux/10 bg-beige-darker/50 p-3"
                      >
                        <div>
                          <span className="font-montserrat text-bordeaux">
                            {option.name}
                          </span>
                          {option.price_modifier && option.price_modifier > 0 && (
                            <span className="ml-2 text-sm text-bordeaux/50">
                              +{formatPrice(option.price_modifier)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditOption(option)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteOptionTarget(option)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-bordeaux/50">Aucune option</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Type Dialog */}
      <Dialog open={!!editType} onOpenChange={() => setEditType(null)}>
        <DialogContent>
          <form action={handleUpdateType}>
            <DialogHeader>
              <DialogTitle>Modifier le type d'option</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type-name">Nom</Label>
                <Input
                  id="edit-type-name"
                  name="name"
                  defaultValue={editType?.name}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditType(null)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Type Dialog */}
      <Dialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le type d'option</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteType?.name}" ?
              Toutes les options associées seront également supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteType(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteType} disabled={isLoading}>
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Option Dialog */}
      <Dialog open={!!editOption} onOpenChange={() => setEditOption(null)}>
        <DialogContent>
          <form onSubmit={handleUpdateOption}>
            <DialogHeader>
              <DialogTitle>Modifier l'option</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type d'option</Label>
                <Select name="option_type_id" defaultValue={editOption?.option_type_id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {optionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-option-name">Nom</Label>
                <Input
                  id="edit-option-name"
                  name="name"
                  defaultValue={editOption?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-option-price">Prix additionnel (€)</Label>
                <Input
                  id="edit-option-price"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editOption?.price_modifier || ''}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOption(null)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Option Dialog */}
      <Dialog open={!!deleteOptionTarget} onOpenChange={() => setDeleteOptionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'option</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteOptionTarget?.name}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOptionTarget(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOption} disabled={isLoading}>
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
