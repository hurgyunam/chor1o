import { getWeeklyChartEntries } from '@/data/teamSongCatalog'

/** 음원차트 곡 순위 */
export interface ChartEntry {
  rank: number
  songName: string
  point: number
}

export interface SongChart {
  /** 플레이어가 작업 중인 곡 (차트에 삽입·강조) */
  songTitle: string
  chartName: string
  entries: ChartEntry[]
}

/** 주간 음원차트 — 작곡팀 카탈로그 곡 상위 12곡 (데모 탐색과 동일 제목·구조) */
export const WEEKLY_SONG_CHART: SongChart = {
  songTitle: 'Fly(가제)',
  chartName: '주간 음원차트',
  entries: getWeeklyChartEntries(),
}

/** 플레이어 작업곡 차트 — 카탈로그 기반 주간 차트 표시 */
export function getChartForSong(songTitle: string): SongChart | null {
  if (songTitle === WEEKLY_SONG_CHART.songTitle) return WEEKLY_SONG_CHART
  return null
}

/** @deprecated FLY_SONG_CHART → WEEKLY_SONG_CHART */
export const FLY_SONG_CHART = WEEKLY_SONG_CHART
