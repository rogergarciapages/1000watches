'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

function generateSlug(brand: string, model: string): string {
  const slugBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const slugModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slugBrand}/${slugModel}`
}

export async function fillNextSlot(
  submissionId: string,
  brand: string,
  model: string,
  year: number,
  material: string | null,
  movement_type: string | null,
  image_url: string | null
) {
  const supabase = await createAdminClient()

  const { data: emptySlot, error: slotError } = await supabase
    .from('slots')
    .select('id, uuid')
    .eq('status', 'empty')
    .order('id', { ascending: true })
    .limit(1)
    .single()

  if (slotError || !emptySlot) {
    return { ok: false, error: 'No empty slots available.' }
  }

  const slug = generateSlug(brand, model)

  const updateData: Record<string, unknown> = {
    brand,
    model,
    year,
    material: material || null,
    movement_type: movement_type || null,
    image_url: image_url || null,
    slug,
    status: 'filled',
  }

  if (!emptySlot.uuid) {
    updateData.uuid = crypto.randomUUID()
  }

  const { error: fillError } = await supabase
    .from('slots')
    .update(updateData)
    .eq('id', emptySlot.id)

  if (fillError) {
    return { ok: false, error: fillError.message }
  }

  const { error: deleteError } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId)

  if (deleteError) {
    return { ok: false, error: deleteError.message }
  }

  try {
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/timepieces')
    revalidatePath(`/timepieces/${slug}`)
  } catch {}

  return { ok: true, slotId: emptySlot.id, brand, model }
}

export async function dismissSubmission(submissionId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId)

  console.log('[dismissSubmission] error:', error)

  if (error) {
    return { ok: false, error: error.message }
  }

  try {
    revalidatePath('/admin')
    revalidatePath('/')
  } catch {}

  return { ok: true }
}

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
      reference: null,
      slug: null,
      status: 'empty',
    })
    .eq('id', slotId)

  if (error) return { ok: false, error: error.message }

  try {
    revalidatePath('/admin')
    revalidatePath('/timepieces')
    revalidatePath('/')
  } catch {}

  return { ok: true }
}

export async function assignToSlot(
  slotId: number,
  brand: string,
  model: string,
  year: number,
  material: string | null,
  movement_type: string | null,
  reference: string | null
) {
  const supabase = await createAdminClient()

  const slug = generateSlug(brand, model)

  const updateData: Record<string, unknown> = {
    brand,
    model,
    year,
    material: material || null,
    movement_type: movement_type || null,
    image_url: null,
    reference: reference || null,
    slug,
    status: 'filled',
  }

  const { data: slot } = await supabase
    .from('slots')
    .select('uuid')
    .eq('id', slotId)
    .single()

  if (slot && !slot.uuid) {
    updateData.uuid = crypto.randomUUID()
  }

  const { error } = await supabase
    .from('slots')
    .update(updateData)
    .eq('id', slotId)

  if (error) return { ok: false, error: error.message }

  try {
    revalidatePath('/admin')
    revalidatePath('/timepieces')
    revalidatePath(`/timepieces/${slug}`)
  } catch {}

  return { ok: true }
}