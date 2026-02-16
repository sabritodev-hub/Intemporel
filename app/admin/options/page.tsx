import { createClient } from '@/lib/supabase/server'
import OptionsClient from './OptionsClient'

async function getOptionTypes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('option_types')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching option types:', error)
    return []
  }
  return data || []
}

async function getOptions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('options')
    .select('*, option_types (*)')
    .order('name')

  if (error) {
    console.error('Error fetching options:', error)
    return []
  }
  return data || []
}

export default async function OptionsPage() {
  const [optionTypes, options] = await Promise.all([
    getOptionTypes(),
    getOptions(),
  ])

  return <OptionsClient optionTypes={optionTypes} options={options} />
}
