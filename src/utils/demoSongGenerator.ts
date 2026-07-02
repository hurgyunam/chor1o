import type {
  DemoPartBlock,
  DemoSong,
  GenerateDemoSongOptions,
} from '@/types/demo'
import type { ComposerTeam } from '@/types/composerTeam'
import type { TeamCatalogSong } from '@/types/teamSongCatalog'
import { pickCatalogSongForTeam } from '@/data/teamSongCatalog'
import {
  getPartValueRangeForSkill,
  isLowSkillTeam,
  pickTeamForCostRange,
} from '@/utils/composerTeamUtils'

const MIN_PART_COUNT = 7
const MAX_PART_COUNT = 15
const GENERATE_MAX_ATTEMPTS = 24

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!
}

function sumDuration(segments: readonly { duration: number }[]): number {
  return segments.reduce((sum, segment) => sum + segment.duration, 0)
}

function clampTargetCost(
  costMin: number,
  costMax: number,
  partCount: number,
  partMin: number,
  partMax: number,
): number | null {
  const low = Math.max(costMin, partCount * partMin)
  const high = Math.min(costMax, partCount * partMax)
  if (low > high) return null
  return randomInt(low, high)
}

function distributePartUniqueValues(
  targetSum: number,
  count: number,
  min: number,
  max: number,
  compositionSkill: number,
): number[] {
  const values = Array.from({ length: count }, () => min)
  let remaining = targetSum - count * min
  const maxExtra = count * (max - min)
  remaining = Math.max(0, Math.min(remaining, maxExtra))

  const order = Array.from({ length: count }, (_, index) => index)
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[order[i], order[j]] = [order[j]!, order[i]!]
  }

  for (const index of order) {
    if (remaining <= 0) break
    const headroom = max - values[index]!
    if (headroom <= 0) continue
    const chunk = isLowSkillTeam(compositionSkill)
      ? randomInt(0, Math.min(remaining, headroom))
      : randomInt(1, Math.min(remaining, headroom))
    values[index]! += chunk
    remaining -= chunk
  }

  if (remaining > 0) {
    for (const index of order) {
      if (remaining <= 0) break
      const headroom = max - values[index]!
      if (headroom <= 0) continue
      const chunk = Math.min(remaining, headroom)
      values[index]! += chunk
      remaining -= chunk
    }
  }

  if (isLowSkillTeam(compositionSkill) && count >= 3) {
    const goodCount = randomInt(1, 2)
    const goodIndices = new Set<number>()
    while (goodIndices.size < goodCount) {
      goodIndices.add(randomInt(0, count - 1))
    }

    for (let index = 0; index < count; index++) {
      if (goodIndices.has(index)) continue
      const reclaimable = values[index]! - min
      if (reclaimable <= 0) continue
      const transfer = randomInt(1, reclaimable)
      values[index]! -= transfer
      const goodIndex = pickRandom([...goodIndices])
      values[goodIndex] = Math.min(max, values[goodIndex]! + transfer)
    }
  }

  const currentSum = values.reduce((sum, value) => sum + value, 0)
  let diff = targetSum - currentSum
  let guard = 0
  while (diff !== 0 && guard < count * max * 2) {
    guard += 1
    const index = randomInt(0, count - 1)
    if (diff > 0 && values[index]! < max) {
      values[index]! += 1
      diff -= 1
    } else if (diff < 0 && values[index]! > min) {
      values[index]! -= 1
      diff += 1
    }
  }

  return values
}

function catalogToParts(catalogSong: TeamCatalogSong, uniqueValues: number[]): DemoPartBlock[] {
  return catalogSong.segments.map((segment, index) => ({
    id: `part-${index}`,
    label: segment.label,
    duration: segment.duration,
    bonusMultiplier: uniqueValues[index]! / 100,
    ...catalogSong.partAffinities[index]!,
  }))
}

export function calcPartUniqueValue(part: DemoPartBlock): number {
  return Math.round(part.bonusMultiplier * 100)
}

export function calcDemoCost(parts: DemoPartBlock[]): number {
  return parts.reduce((sum, part) => sum + calcPartUniqueValue(part), 0)
}

export const DEMO_COST_THEORETICAL_MIN = MIN_PART_COUNT * 52
export const DEMO_COST_THEORETICAL_MAX = MAX_PART_COUNT * 145

function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildDemoSong(
  catalogSong: TeamCatalogSong,
  team: ComposerTeam,
  uniqueValues: number[],
): DemoSong {
  const parts = catalogToParts(catalogSong, uniqueValues)

  return {
    id: createUniqueId(),
    catalogSongId: catalogSong.id,
    teamId: team.id,
    teamName: team.name,
    teamPrimaryType: team.primaryType,
    compositionSkill: team.compositionSkill,
    title: catalogSong.title,
    structureType: catalogSong.structureType,
    segments: catalogSong.segments.map((segment) => ({ ...segment })),
    parts,
    totalDuration: sumDuration(catalogSong.segments),
    cost: calcDemoCost(parts),
  }
}

function tryBuildDemo(
  team: ComposerTeam,
  catalogSong: TeamCatalogSong,
  costMin: number,
  costMax: number,
): DemoSong | null {
  const { min: partMin, max: partMax } = getPartValueRangeForSkill(team.compositionSkill)
  const partCount = catalogSong.segments.length
  const targetCost = clampTargetCost(costMin, costMax, partCount, partMin, partMax)
  if (targetCost === null) return null

  const uniqueValues = distributePartUniqueValues(
    targetCost,
    partCount,
    partMin,
    partMax,
    team.compositionSkill,
  )
  const song = buildDemoSong(catalogSong, team, uniqueValues)
  if (song.cost < costMin || song.cost > costMax) return null
  return song
}

export function generateDemoSong(options: GenerateDemoSongOptions): DemoSong {
  const { costMin, costMax } = options

  for (let attempt = 0; attempt < GENERATE_MAX_ATTEMPTS; attempt++) {
    const team = pickTeamForCostRange(costMin, costMax)
    const catalogSong = pickCatalogSongForTeam(team, costMin, costMax)
    if (!catalogSong) continue

    const song = tryBuildDemo(team, catalogSong, costMin, costMax)
    if (song) return song
  }

  const fallbackTeam = pickTeamForCostRange(costMin, costMax)
  const fallbackCatalog = pickCatalogSongForTeam(fallbackTeam, costMin, costMax)
  if (fallbackCatalog) {
    const song = tryBuildDemo(fallbackTeam, fallbackCatalog, costMin, costMax)
    if (song) return song
  }

  const anyTeam = pickTeamForCostRange(costMin, costMax)
  const anyCatalog = pickCatalogSongForTeam(anyTeam, costMin, costMax) ?? pickCatalogSongForTeam(anyTeam, DEMO_COST_THEORETICAL_MIN, DEMO_COST_THEORETICAL_MAX)
  if (anyCatalog) {
    const range = getPartValueRangeForSkill(anyTeam.compositionSkill)
    const mid = Math.round((costMin + costMax) / 2)
    const target = Math.min(
      anyCatalog.segments.length * range.max,
      Math.max(anyCatalog.segments.length * range.min, mid),
    )
    const uniqueValues = distributePartUniqueValues(
      target,
      anyCatalog.segments.length,
      range.min,
      range.max,
      anyTeam.compositionSkill,
    )
    return buildDemoSong(anyCatalog, anyTeam, uniqueValues)
  }

  throw new Error('데모 곡 카탈로그에서 곡을 찾지 못했습니다.')
}

export function formatDemoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  return `${minutes}:${remain.toString().padStart(2, '0')}`
}

export function formatStructureSummary(segments: { label: string }[]): string {
  return segments.map((segment) => segment.label).join(' · ')
}
