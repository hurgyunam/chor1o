import { COMPOSER_TEAMS } from '@/data/composerTeams'
import type { ComposerTeam } from '@/types/composerTeam'
import type { DemoPartSegment, DemoStructureType } from '@/types/demo'
import type { CatalogPartAffinity, TeamCatalogSong } from '@/types/teamSongCatalog'
import type { RGBType } from '@/types'
import { createSeededRngFromString, type SeededRng } from '@/utils/seededRandom'

export const SONGS_PER_TEAM = 30

const MAIN_FIXED_PARTS = 7

const TITLE_PREFIXES = [
  'Midnight',
  'Starlight',
  'Neon',
  'Crystal',
  'Velvet',
  'Golden',
  'Silver',
  'Electric',
  'Cosmic',
  'Prism',
  'Aurora',
  'Velvet',
] as const

const TITLE_SUFFIXES = [
  'Dream',
  'Pulse',
  'Wave',
  'Glow',
  'Rush',
  'Heart',
  'Sky',
  'Fire',
  'Run',
  'Night',
  'Echo',
  'Drift',
] as const

const RGB_TYPES: RGBType[] = ['R', 'G', 'B']

function verseLabel(verseGroup: 1 | 2, index: number): string {
  return `벌스${verseGroup}-${index}`
}

function chorusLabel(index: number): string {
  return index > 1 ? `싸비${index}` : '싸비'
}

function segmentDuration(rng: SeededRng, kind: DemoPartSegment['kind']): number {
  switch (kind) {
    case 'intro':
    case 'outro':
      return rng.int(12, 22)
    case 'bridge':
      return rng.int(15, 24)
    case 'chorus':
      return rng.int(26, 36)
    case 'verse':
      return rng.int(18, 28)
  }
}

function sumDuration(segments: DemoPartSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.duration, 0)
}

function buildMainStructure(rng: SeededRng, partCount: number): DemoPartSegment[] | null {
  const verseTotal = partCount - MAIN_FIXED_PARTS
  if (verseTotal < 2 || verseTotal > 8) return null

  const options: { verse1Count: number; verse2Count: number }[] = []
  for (let verse1Count = 1; verse1Count <= 4; verse1Count++) {
    for (let verse2Count = 1; verse2Count <= 4; verse2Count++) {
      if (verse1Count + verse2Count === verseTotal) {
        options.push({ verse1Count, verse2Count })
      }
    }
  }
  if (options.length === 0) return null

  const { verse1Count, verse2Count } = rng.pick(options)
  const segments: DemoPartSegment[] = []
  let chorusIndex = 0

  segments.push({ kind: 'intro', label: '인트로', duration: segmentDuration(rng, 'intro') })

  for (let i = 1; i <= verse1Count; i++) {
    segments.push({ kind: 'verse', label: verseLabel(1, i), duration: segmentDuration(rng, 'verse') })
  }

  chorusIndex += 1
  segments.push({ kind: 'chorus', label: chorusLabel(chorusIndex), duration: segmentDuration(rng, 'chorus') })

  for (let i = 1; i <= verse2Count; i++) {
    segments.push({ kind: 'verse', label: verseLabel(2, i), duration: segmentDuration(rng, 'verse') })
  }

  chorusIndex += 1
  segments.push({ kind: 'chorus', label: chorusLabel(chorusIndex), duration: segmentDuration(rng, 'chorus') })
  segments.push({ kind: 'bridge', label: '브릿지', duration: segmentDuration(rng, 'bridge') })

  chorusIndex += 1
  segments.push({ kind: 'chorus', label: chorusLabel(chorusIndex), duration: segmentDuration(rng, 'chorus') })
  segments.push({ kind: 'outro', label: '아웃트로', duration: segmentDuration(rng, 'outro') })

  return segments
}

function buildSpecialSegment(
  rng: SeededRng,
  kind: DemoPartSegment['kind'],
  chorusIndex: number,
  verseIndex: number,
): DemoPartSegment {
  switch (kind) {
    case 'intro':
      return { kind, label: '인트로', duration: segmentDuration(rng, 'intro') }
    case 'bridge':
      return { kind, label: '브릿지', duration: segmentDuration(rng, 'bridge') }
    case 'outro':
      return { kind, label: '아웃트로', duration: segmentDuration(rng, 'outro') }
    case 'chorus':
      return { kind, label: chorusLabel(chorusIndex), duration: segmentDuration(rng, 'chorus') }
    case 'verse':
      return { kind, label: `벌스${verseIndex}`, duration: segmentDuration(rng, 'verse') }
  }
}

function buildSpecialStructure(rng: SeededRng, segmentCount: number): DemoPartSegment[] {
  const targetDuration = rng.int(120, 300)
  const pool: DemoPartSegment['kind'][] = ['intro', 'verse', 'chorus', 'bridge', 'verse', 'chorus', 'outro']

  let segments: DemoPartSegment[] = []
  let chorusCount = 0
  let verseIndex = 0
  let chorusIndex = 0

  for (let i = 0; i < segmentCount; i++) {
    const kind = rng.pick(pool)
    if (kind === 'verse') verseIndex += 1
    if (kind === 'chorus') {
      chorusIndex += 1
      chorusCount += 1
    }
    segments.push(buildSpecialSegment(rng, kind, chorusIndex, verseIndex))
  }

  while (chorusCount < 2) {
    chorusIndex += 1
    chorusCount += 1
    const insertAt = rng.int(1, Math.max(1, segments.length - 1))
    segments.splice(insertAt, 0, buildSpecialSegment(rng, 'chorus', chorusIndex, verseIndex))
  }

  let total = sumDuration(segments)
  if (total < 120 || total > 300) {
    const scale = targetDuration / total
    segments = segments.map((segment) => ({
      ...segment,
      duration: Math.max(8, Math.round(segment.duration * scale)),
    }))
    total = sumDuration(segments)
  }

  if (total < 120) {
    const last = segments[segments.length - 1]
    if (last) last.duration += 120 - total
  } else if (total > 300) {
    const overflow = total - 300
    const adjustable = segments.filter((segment) => segment.kind === 'verse' || segment.kind === 'bridge')
    const target = adjustable[0] ?? segments[segments.length - 1]
    if (target) target.duration = Math.max(8, target.duration - overflow)
  }

  return segments
}

function pickPartCount(rng: SeededRng): number {
  return rng.int(7, 14)
}

function buildStructure(rng: SeededRng, structureType: DemoStructureType): DemoPartSegment[] {
  if (structureType === 'main') {
    for (let attempt = 0; attempt < 12; attempt++) {
      const partCount = pickPartCount(rng)
      const structure = buildMainStructure(rng, partCount)
      if (structure) return structure
    }
    return buildMainStructure(rng, 9)!
  }

  return buildSpecialStructure(rng, pickPartCount(rng))
}

function shuffleTypes(rng: SeededRng, items: RGBType[]): RGBType[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.int(0, i)
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function rollAffinityWithBias(rng: SeededRng, primaryType: RGBType): CatalogPartAffinity {
  if (rng.next() >= 0.7) {
    const [strongType, neutralType, weakType] = shuffleTypes(rng, RGB_TYPES)
    return { strongType: strongType!, neutralType: neutralType!, weakType: weakType! }
  }

  const others = RGB_TYPES.filter((type) => type !== primaryType)
  const [neutralType, weakType] = shuffleTypes(rng, others)
  return {
    strongType: primaryType,
    neutralType: neutralType!,
    weakType: weakType!,
  }
}

function buildTitle(rng: SeededRng, songIndex: number): string {
  const prefix = TITLE_PREFIXES[(songIndex + rng.int(0, TITLE_PREFIXES.length - 1)) % TITLE_PREFIXES.length]!
  const suffix = TITLE_SUFFIXES[rng.int(0, TITLE_SUFFIXES.length - 1)]!
  return `${prefix} ${suffix}`
}

function calcChartPoint(team: ComposerTeam, songIndex: number, rng: SeededRng): number {
  const skillBase = team.compositionSkill * 120
  const hitSpread = rng.int(0, 4200)
  const slotVariance = (SONGS_PER_TEAM - songIndex) * 28
  return skillBase + hitSpread + slotVariance
}

function buildCatalogSong(team: ComposerTeam, songIndex: number): TeamCatalogSong {
  const seedKey = `${team.id}#${songIndex}`
  const rng = createSeededRngFromString(seedKey)
  const structureType: DemoStructureType = songIndex % 5 === 0 ? 'special' : 'main'
  const segments = buildStructure(rng, structureType)
  const partAffinities = segments.map(() => rollAffinityWithBias(rng, team.primaryType))

  return {
    id: `${team.id}-song-${String(songIndex + 1).padStart(2, '0')}`,
    teamId: team.id,
    title: buildTitle(rng, songIndex),
    structureType,
    segments,
    partAffinities,
    chartPoint: calcChartPoint(team, songIndex, rng),
  }
}

function buildTeamCatalog(team: ComposerTeam): TeamCatalogSong[] {
  return Array.from({ length: SONGS_PER_TEAM }, (_, index) => buildCatalogSong(team, index))
}

export function buildAllTeamSongCatalogs(): TeamCatalogSong[] {
  return COMPOSER_TEAMS.flatMap((team) => buildTeamCatalog(team))
}
