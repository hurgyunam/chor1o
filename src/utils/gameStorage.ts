export const GAME_STORAGE_KEY = 'game'

export interface GameSnapshot {
  coins: number
}

export function saveGameState(snapshot: GameSnapshot): void {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // storage quota, private mode 등
  }
}

export function loadGameState(): GameSnapshot | null {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as GameSnapshot
    if (typeof parsed?.coins !== 'number' || !Number.isFinite(parsed.coins)) return null

    return parsed
  } catch {
    return null
  }
}
