/** 음원차트 곡 순위 (MVP 목업 데이터) */
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

/** 현재 곡(Fly 가제)이 속한 음원차트 — 포인트는 내림차순 */
export const FLY_SONG_CHART: SongChart = {
  songTitle: 'Fly(가제)',
  chartName: '주간 음원차트',
  entries: [
    { rank: 1, songName: 'Midnight Run', point: 14_280 },
    { rank: 2, songName: '네온 펄스', point: 13_640 },
    { rank: 3, songName: 'Starlight', point: 12_950 },
    { rank: 4, songName: '미러볼', point: 12_100 },
    { rank: 5, songName: 'Prism Heart', point: 11_420 },
    { rank: 6, songName: '글로우 업', point: 10_680 },
    { rank: 7, songName: 'Beat Wave', point: 9_940 },
    { rank: 8, songName: '코스믹 드림', point: 9_210 },
    { rank: 9, songName: 'Dreamcatcher', point: 8_550 },
    { rank: 10, songName: '펄스', point: 7_880 },
    { rank: 11, songName: 'Aurora', point: 7_120 },
    { rank: 12, songName: '이클립스', point: 6_340 },
  ],
}

export function getChartForSong(songTitle: string): SongChart | null {
  if (songTitle === FLY_SONG_CHART.songTitle) return FLY_SONG_CHART
  return null
}
