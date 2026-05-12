import { z } from 'zod'

export const watchSpecsSchema = z.object({
  watch_id: z.string().uuid().optional(),
  
  // Core Identification
  collection: z.string().optional(),
  model_name: z.string().optional(),
  reference_number: z.string().optional(),
  nickname: z.string().optional(),
  country_of_origin: z.string().optional(),
  release_year: z.number().int().min(1800).max(2100).optional(),
  limited_edition: z.boolean().optional(),
  limited_quantity: z.number().int().positive().optional(),
  
  // Watch Type & Usage
  watch_type: z.string().optional(),
  gender_target: z.string().optional(),
  style: z.string().optional(),
  intended_use: z.string().optional(),
  
  // Case
  case_material: z.string().optional(),
  case_diameter_mm: z.number().positive().optional(),
  case_thickness_mm: z.number().positive().optional(),
  lug_width_mm: z.number().int().positive().optional(),
  weight_grams: z.number().positive().optional(),
  case_shape: z.string().optional(),
  case_finish: z.string().optional(),
  crown_type: z.string().optional(),
  water_resistance_meters: z.number().int().nonnegative().optional(),
  crystal_material: z.string().optional(),
  bezel_type: z.string().optional(),
  
  // Dial & Hands
  dial_color: z.string().optional(),
  dial_finish: z.string().optional(),
  indices_type: z.string().optional(),
  lume_type: z.string().optional(),
  hands_style: z.string().optional(),
  
  // Movement
  movement_brand: z.string().optional(),
  movement_model: z.string().optional(),
  movement_type: z.string().optional(),
  jewels_count: z.number().int().nonnegative().optional(),
  power_reserve_hours: z.number().int().nonnegative().optional(),
  beat_rate_vph: z.number().int().nonnegative().optional(),
  cosc_certified: z.boolean().optional(),
  hand_winding: z.boolean().optional(),
  
  // Strap/Bracelet
  strap_type: z.string().optional(),
  strap_material: z.string().optional(),
  strap_color: z.string().optional(),
  clasp_type: z.string().optional(),
  bracelet: z.boolean().optional(),
  
  // Market & Pricing
  msrp: z.number().positive().optional(),
  currency: z.string().optional(),
  availability: z.string().optional(),
  discontinued: z.boolean().optional(),
})

export type WatchSpecs = z.infer<typeof watchSpecsSchema>

// Field definitions for display
type SpecField = {
  key: string
  label: string
  suffix?: string
  prefix?: string
  isBoolean?: boolean
}

export const specFields: Record<string, SpecField[]> = {
  core: [
    { key: 'collection', label: 'Collection' },
    { key: 'reference_number', label: 'Reference Number' },
    { key: 'nickname', label: 'Nickname' },
    { key: 'country_of_origin', label: 'Country of Origin' },
    { key: 'release_year', label: 'Release Year' },
    { key: 'limited_edition', label: 'Limited Edition', isBoolean: true },
    { key: 'limited_quantity', label: 'Limited Quantity' },
  ],
  type: [
    { key: 'watch_type', label: 'Watch Type' },
    { key: 'gender_target', label: 'Gender Target' },
    { key: 'style', label: 'Style' },
    { key: 'intended_use', label: 'Intended Use' },
  ],
  case: [
    { key: 'case_material', label: 'Case Material' },
    { key: 'case_diameter_mm', label: 'Case Diameter', suffix: 'mm' },
    { key: 'case_thickness_mm', label: 'Case Thickness', suffix: 'mm' },
    { key: 'lug_width_mm', label: 'Lug Width', suffix: 'mm' },
    { key: 'weight_grams', label: 'Weight', suffix: 'g' },
    { key: 'case_shape', label: 'Case Shape' },
    { key: 'case_finish', label: 'Case Finish' },
    { key: 'crown_type', label: 'Crown Type' },
    { key: 'water_resistance_meters', label: 'Water Resistance', suffix: 'm' },
    { key: 'crystal_material', label: 'Crystal' },
    { key: 'bezel_type', label: 'Bezel' },
  ],
  dial: [
    { key: 'dial_color', label: 'Dial Color' },
    { key: 'dial_finish', label: 'Dial Finish' },
    { key: 'indices_type', label: 'Indices Type' },
    { key: 'lume_type', label: 'Lume Type' },
    { key: 'hands_style', label: 'Hands Style' },
  ],
  movement: [
    { key: 'movement_brand', label: 'Movement Brand' },
    { key: 'movement_model', label: 'Caliber' },
    { key: 'movement_type', label: 'Movement Type' },
    { key: 'jewels_count', label: 'Jewels' },
    { key: 'power_reserve_hours', label: 'Power Reserve', suffix: 'h' },
    { key: 'beat_rate_vph', label: 'Beat Rate', suffix: 'vph' },
    { key: 'cosc_certified', label: 'COSC Certified', isBoolean: true },
    { key: 'hand_winding', label: 'Hand Winding', isBoolean: true },
  ],
  strap: [
    { key: 'strap_type', label: 'Strap Type' },
    { key: 'strap_material', label: 'Strap Material' },
    { key: 'strap_color', label: 'Strap Color' },
    { key: 'clasp_type', label: 'Clasp Type' },
    { key: 'bracelet', label: 'Bracelet Included', isBoolean: true },
  ],
  market: [
    { key: 'msrp', label: 'MSRP', prefix: '$' },
    { key: 'currency', label: 'Currency' },
    { key: 'availability', label: 'Availability' },
    { key: 'discontinued', label: 'Discontinued', isBoolean: true },
  ],
}

export type SpecCategory = keyof typeof specFields