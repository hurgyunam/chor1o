import type { DemoSong } from '@/types/demo'

export const SONGS_STORAGE_KEY = 'songs'

export interface PurchasedSong extends DemoSong {
  purchasedAt: number
}

export function loadPurchasedSongs(): PurchasedSong[] {
  try {
    const raw = localStorage.getItem(SONGS_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as PurchasedSong[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (song) =>
        typeof song?.id === 'string' &&
        typeof song?.title === 'string' &&
        Array.isArray(song?.parts),
    )
  } catch {
    return []
  }
}

export function savePurchasedSongs(songs: PurchasedSong[]): void {
  try {
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs))
  } catch {
    // storage quota, private mode 등
  }
}

export function addPurchasedSong(demo: DemoSong): PurchasedSong {
  const songs = loadPurchasedSongs()
  const purchased: PurchasedSong = {
    ...demo,
    purchasedAt: Date.now(),
  }
  savePurchasedSongs([...songs, purchased])
  return purchased
}

export function isSongPurchased(demoId: string): boolean {
  return loadPurchasedSongs().some((song) => song.id === demoId)
}
