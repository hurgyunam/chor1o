import type { RGBType } from '@/types'

const RGB_TYPES: RGBType[] = ['R', 'G', 'B']

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function rollRandomAffinity(): {
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
} {
  const [strongType, neutralType, weakType] = shuffle(RGB_TYPES)
  return { strongType: strongType!, neutralType: neutralType!, weakType: weakType! }
}
