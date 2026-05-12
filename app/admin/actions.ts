'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

function generateSlug(brand: string, model: string): string {
  const slugBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const slugModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slugBrand}-${slugModel}`
}

interface SubmissionData {
  brand: string
  model: string
  year: number
  material?: string
  movement_type?: string
  image_url?: string
  reference?: string
}

// Fill the next available empty slot with a submission's data
export async function fillNextSlot(submissionId: string, data: SubmissionData) {
  console.log('fillNextSlot called with:', { submissionId, data })
  
  const supabase = await createAdminClient()

  // Find the lowest-numbered empty slot
  console.log('Finding empty slot...')
  const { data: emptySlot, error: slotError } = await supabase
    .from('slots')
    .select('id')
    .eq('status', 'empty')
    .order('id', { ascending: true })
    .limit(1)
    .single()

  console.log('Empty slot result:', { emptySlot, error: slotError })

  if (slotError || !emptySlot) {
    console.error('Slot error:', slotError)
    return { error: 'No empty slots available.' }
  }

  // Generate slug
  const slug = generateSlug(data.brand, data.model)
  console.log('Updating slot:', emptySlot.id, 'with slug:', slug)

  // Fill the slot
  const updateData = { 
    brand: data.brand, 
    model: data.model, 
    year: data.year,
    material: data.material || null,
    movement_type: data.movement_type || null,
    image_url: data.image_url || null,
    reference: data.reference || null,
    slug,
    status: 'filled' 
  }
  
  const { error: fillError } = await supabase
    .from('slots')
    .update(updateData)
    .eq('id', emptySlot.id)

  console.log('Update result:', { error: fillError })

  if (fillError) {
    console.error('Fill error:', fillError)
    return { error: fillError.message }
  }

  // Delete the submission now it's been processed
  console.log('Deleting submission:', submissionId)
  const { error: deleteError } = await supabase.from('submissions').delete().eq('id', submissionId)
  console.log('Delete result:', { error: deleteError })
  if (deleteError) {
    console.error('Delete error:', deleteError)
  }

  // Verify the update worked
  const { data: verifySlot } = await supabase
    .from('slots')
    .select('*')
    .eq('id', emptySlot.id)
    .single()
  console.log('Verified slot:', verifySlot)

  // Revalidate multiple paths to ensure frontend updates
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/timepieces')
  revalidatePath('/timepieces/*')
  
  return { ok: true, slotId: emptySlot.id, brand: data.brand, model: data.model }
}

// Clear a slot back to empty
export async function clearSlot(slotId: number) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('slots')
    .update({ 
      brand: null, 
      model: null, 
      year: null,
      material: null,
      movement_type: null,
      image_url: null,
      reference: null,
      slug: null,
      status: 'empty' 
    })
    .eq('id', slotId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/timepieces')
  return { ok: true }
}

// Dismiss a submission without filling a slot
export async function dismissSubmission(submissionId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase.from('submissions').delete().eq('id', submissionId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { ok: true }
}

// Manually assign a watch to a specific slot
export async function assignToSlot(
  slotId: number, 
  brand: string, 
  model: string, 
  year: number,
  material?: string,
  movement_type?: string,
  image_url?: string,
  reference?: string
) {
  const supabase = await createAdminClient()
  
  const slug = generateSlug(brand, model)

  const { error } = await supabase
    .from('slots')
    .update({ 
      brand, 
      model, 
      year,
      material: material || null,
      movement_type: movement_type || null,
      image_url: image_url || null,
      reference: reference || null,
      slug,
      status: 'filled' 
    })
    .eq('id', slotId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/timepieces')
  return { ok: true }
}
