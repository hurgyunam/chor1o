/** 파트 고유 배율 하한 (85%) */
export const PART_BONUS_MIN = 0.85

/** 파트 고유 배율 상한 (115%) */
export const PART_BONUS_MAX = 1.15

/** 리롤 1회당 고유 배율 변동폭 (±3%p) */
export const PART_BONUS_REROLL_STEP = 0.03

/** 리롤 시 고유 배율이 내려갈 확률 (올라갈 확률보다 약간 높음) */
export const PART_BONUS_DOWN_CHANCE = 0.58

export function clampPartBonus(value: number): number {
  return Math.min(PART_BONUS_MAX, Math.max(PART_BONUS_MIN, value))
}

export function rollPartBonusDelta(): number {
  const direction = Math.random() < PART_BONUS_DOWN_CHANCE ? -1 : 1
  return direction * PART_BONUS_REROLL_STEP
}

export function rerollPartBonus(current: number): { next: number; delta: number } {
  const raw = current + rollPartBonusDelta()
  const next = clampPartBonus(raw)
  return { next, delta: next - current }
}

export function formatPartBonus(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
}
