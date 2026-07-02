/** 문자열을 32비트 시드로 변환 (FNV-1a) */
export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export interface SeededRng {
  /** [0, 1) */
  next: () => number
  int: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
}

/** 동일 시드 → 동일 난수열. 카탈로그 곡 구조 고정 생성에 사용 */
export function createSeededRng(seed: number): SeededRng {
  let state = seed >>> 0

  function next(): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }

  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min
  }

  return {
    next,
    int,
    pick<T>(items: readonly T[]): T {
      return items[int(0, items.length - 1)]!
    },
  }
}

export function createSeededRngFromString(seedText: string): SeededRng {
  return createSeededRng(hashString(seedText))
}
