import type { ComposerTeam } from '@/types/composerTeam'
import type { TeamCatalogSong } from '@/types/teamSongCatalog'
import { COMPOSER_TEAMS } from '@/data/composerTeams'
import { getPartValueRangeForSkill } from '@/utils/composerTeamUtils'
import { buildAllTeamSongCatalogs } from '@/utils/teamSongCatalogBuilder'

const ALL_CATALOG_SONGS: TeamCatalogSong[] = buildAllTeamSongCatalogs()

const CATALOG_BY_ID = new Map<string, TeamCatalogSong>(
  ALL_CATALOG_SONGS.map((song) => [song.id, song]),
)

const CATALOG_BY_TEAM_ID = new Map<string, TeamCatalogSong[]>()
for (const team of COMPOSER_TEAMS) {
  CATALOG_BY_TEAM_ID.set(
    team.id,
    ALL_CATALOG_SONGS.filter((song) => song.teamId === team.id),
  )
}

const CATALOG_BY_TITLE = new Map<string, TeamCatalogSong>()
for (const song of ALL_CATALOG_SONGS) {
  if (!CATALOG_BY_TITLE.has(song.title)) {
    CATALOG_BY_TITLE.set(song.title, song)
  }
}

export { ALL_CATALOG_SONGS as TEAM_SONG_CATALOG }

export function getCatalogSongById(id: string): TeamCatalogSong | undefined {
  return CATALOG_BY_ID.get(id)
}

export function getCatalogSongByTitle(title: string): TeamCatalogSong | undefined {
  return CATALOG_BY_TITLE.get(title)
}

export function getTeamCatalogSongs(teamId: string): readonly TeamCatalogSong[] {
  return CATALOG_BY_TEAM_ID.get(teamId) ?? []
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!
}

/** 팀·비용 범위에 맞는 카탈로그 곡 후보에서 1곡 선택 */
export function pickCatalogSongForTeam(
  team: ComposerTeam,
  costMin: number,
  costMax: number,
): TeamCatalogSong | null {
  const { min: partMin, max: partMax } = getPartValueRangeForSkill(team.compositionSkill)
  const eligible = getTeamCatalogSongs(team.id).filter((song) => {
    const partCount = song.segments.length
    return partCount * partMin <= costMax && partCount * partMax >= costMin
  })

  return eligible.length > 0 ? pickRandom(eligible) : null
}

const WEEKLY_CHART_SIZE = 12

export interface WeeklyChartEntry {
  rank: number
  songName: string
  point: number
}

/** 카탈로그 곡 chartPoint 상위 — 데모에서 본 곡이 차트에도 등장 */
export function getWeeklyChartEntries(): WeeklyChartEntry[] {
  const sorted = [...ALL_CATALOG_SONGS].sort((a, b) => b.chartPoint - a.chartPoint)
  const seenTitles = new Set<string>()
  const entries: WeeklyChartEntry[] = []

  for (const song of sorted) {
    if (seenTitles.has(song.title)) continue
    seenTitles.add(song.title)
    entries.push({
      rank: entries.length + 1,
      songName: song.title,
      point: song.chartPoint,
    })
    if (entries.length >= WEEKLY_CHART_SIZE) break
  }

  return entries
}
