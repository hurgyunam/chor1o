import type { RGBType } from '@/types'

export const RGB_COLOR_VAR: Record<RGBType, string> = {
  R: 'var(--color-r)',
  G: 'var(--color-g)',
  B: 'var(--color-b)',
}

export const RGB_LABEL: Record<RGBType, string> = {
  R: 'R',
  G: 'G',
  B: 'B',
}

export function getRgbColor(type: RGBType): string {
  return RGB_COLOR_VAR[type]
}
