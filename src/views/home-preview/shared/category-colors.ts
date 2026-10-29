import { CategoryKey } from '../mock/ugly-cash-series'

// Blue ramp stepped by lightness so stacks read without relying on hue; Savings in the home's growth green.
export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  deposits: 'hsl(212 99% 28%)',
  withdrawals: 'hsl(212 92% 44%)',
  sends: 'hsl(210 88% 60%)',
  card: 'hsl(205 85% 76%)',
  savings: 'hsl(160 66% 42%)',
  other: 'hsl(34 22% 68%)',
}
