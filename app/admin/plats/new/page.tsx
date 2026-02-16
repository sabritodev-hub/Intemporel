import { createClient } from '@/lib/supabase/server'
import PlatForm from '@/components/admin/PlatForm'

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

export default async function NewPlatPage() {
  const [categories, options] = await Promise.all([
    getCategories(),
    getOptions(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-bordeaux">
          Nouveau plat
        </h1>
        <p className="mt-1 font-montserrat text-bordeaux/70">
          Ajoutez un nouveau dessert à votre carte
        </p>
      </div>

      <PlatForm categories={categories} options={options} />
    </div>
  )
}
