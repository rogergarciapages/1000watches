'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

// Fill the next available empty slot with a submission's data
export async function fillNextSlot(submissionId: string, brand: string, model: string, year: number) {
  const supabase = await createAdminClient()

  // Find the lowest-numbered empty slot
  const { data: emptySlot, error: slotError } = await supabase
    .from('slots')
    .select('id')
    .eq('status', 'empty')
    .order('id', { ascending: true })
    .limit(1)
    .single()

  if (slotError || !emptySlot) {
    return { error: 'No empty slots available.' }
  }

  // Fill the slot
  const { error: fillError } = await supabase
    .from('slots')
    .update({ brand, model, year, status: 'filled' })
    .eq('id', emptySlot.id)

  if (fillError) return { error: fillError.message }

  // Delete the submission now it's been processed
  await supabase.from('submissions').delete().eq('id', submissionId)

  revalidatePath('/admin')
  return { ok: true, slotId: emptySlot.id }
}

// Clear a slot back to empty
export async function clearSlot(slotId: number) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('slots')
    .update({ brand: null, model: null, year: null, status: 'empty' })
    .eq('id', slotId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
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
export async function assignToSlot(slotId: number, brand: string, model: string, year: number) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('slots')
    .update({ brand, model, year, status: 'filled' })
    .eq('id', slotId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { ok: true }
}
