export interface Watch {
  id: string
  brand: string
  model: string
  year: number
  created_at: string
}

export interface Slot {
  id: number
  brand: string | null
  model: string | null
  year: number | null
  status: 'empty' | 'filled'
}
