import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatForm from '@/components/admin/PlatForm'

async function getPlat(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('plats')
    .select('*, plat_options (option_id)')
    .eq('id', id)
    .single()
  return data
}

async function getCategories() {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('*').order('order')
  return data || []
}

async function getOptions() {
  const supabase = createClient()
  const { data } = await supabase
    .from('options')
    .select('*, option_types (*)')
    .order('name')
  return data || []
}

export default async function EditPlatPage({
  params,
}: {
  params: { id: string }
}) {
  const [plat, categories, options] = await Promise.all([
    getPlat(params.id),
    getCategories(),
    getOptions(),
  ])

  if (!plat) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-bordeaux">
          Modifier le plat
        </h1>
        <p className="mt-1 font-montserrat text-bordeaux/70">
          Modifiez les informations du dessert
        </p>
      </div>

      <PlatForm plat={plat} categories={categories} options={options} />
    </div>
  )
}
