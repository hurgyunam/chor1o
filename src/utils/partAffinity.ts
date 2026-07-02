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

/** 작곡팀 주 특성을 strongType에 반영한다. bias 확률로 primaryType이 강점이 된다. */
export function rollAffinityWithBias(primaryType: RGBType, bias = 0.7): {
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
} {
  if (Math.random() >= bias) {
    return rollRandomAffinity()
  }

  const others = RGB_TYPES.filter((type) => type !== primaryType)
  const [neutralType, weakType] = shuffle(others)
  return {
    strongType: primaryType,
    neutralType: neutralType!,
    weakType: weakType!,
  }
}
