import type { PartName, RGBType } from '@/types'

export const TEMP_SONG_PART_KEY = 'temp_song_part'

export interface TempSongPartRecord {
  name: PartName
  assignedMemberId: string | null
  bonusMultiplier?: number
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
}

export interface TempSongPartSnapshot {
  parts: TempSongPartRecord[]
  songTitle?: string
  isConfirmed?: boolean
}

export function saveTempSongPart(snapshot: TempSongPartSnapshot): void {
  try {
    localStorage.setItem(TEMP_SONG_PART_KEY, JSON.stringify(snapshot))
  } catch {
    // storage quota, private mode 등
  }
}

export function loadTempSongPart(): TempSongPartSnapshot | null {
  try {
    const raw = localStorage.getItem(TEMP_SONG_PART_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as TempSongPartSnapshot
    if (!parsed?.parts || !Array.isArray(parsed.parts)) return null

    return parsed
  } catch {
    return null
  }
}
