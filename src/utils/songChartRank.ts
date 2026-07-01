import type { ChartEntry } from '@/data/songChart'

export interface ChartTableRow {
  kind: 'entry' | 'player'
  rank: number
  songName: string
  point: number
  isPlayer: boolean
}

/** 플레이어 포인트가 차트에서 몇 위인지 계산 (1위 = 최고점) */
export function calcPlayerRank(entries: ChartEntry[], playerPoint: number): number {
  const higherCount = entries.filter((e) => e.point > playerPoint).length
  return higherCount + 1
}

/** 차트 항목 사이에 플레이어 곡 행을 삽입한 테이블 행 목록 */
export function buildChartTableRows(
  entries: ChartEntry[],
  playerPoint: number,
  playerSongName: string,
): ChartTableRow[] {
  const playerRank = calcPlayerRank(entries, playerPoint)
  const rows: ChartTableRow[] = []
  let playerInserted = false

  for (const entry of entries) {
    if (!playerInserted && playerPoint >= entry.point) {
      rows.push({
        kind: 'player',
        rank: playerRank,
        songName: playerSongName,
        point: playerPoint,
        isPlayer: true,
      })
      playerInserted = true
    }

    rows.push({
      kind: 'entry',
      rank: entry.rank,
      songName: entry.songName,
      point: entry.point,
      isPlayer: false,
    })
  }

  if (!playerInserted) {
    rows.push({
      kind: 'player',
      rank: playerRank,
      songName: playerSongName,
      point: playerPoint,
      isPlayer: true,
    })
  }

  return rows
}
