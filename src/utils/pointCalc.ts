import type { Member, PartBlock, RGBType, Stat } from '@/types'

export type AffinityTier = 'strong' | 'neutral' | 'weak'

export const AFFINITY_MULTIPLIER: Record<AffinityTier, number> = {
  strong: 3.5,
  neutral: 1.0,
  weak: 0.15,
}

export const AFFINITY_LABEL: Record<AffinityTier, string> = {
  strong: '350%',
  neutral: '100%',
  weak: '15%',
}

export interface PartAffinity {
  type: RGBType
  tier: AffinityTier
  multiplier: number
  label: string
}

export interface StatPointBreakdown {
  label: string
  stat: Stat
  tier: AffinityTier
  multiplier: number
  point: number
}

export function getPartAffinities(part: PartBlock): PartAffinity[] {
  return [
    { type: part.strongType, tier: 'strong', multiplier: AFFINITY_MULTIPLIER.strong, label: AFFINITY_LABEL.strong },
    { type: part.neutralType, tier: 'neutral', multiplier: AFFINITY_MULTIPLIER.neutral, label: AFFINITY_LABEL.neutral },
    { type: part.weakType, tier: 'weak', multiplier: AFFINITY_MULTIPLIER.weak, label: AFFINITY_LABEL.weak },
  ]
}

function getAffinityTier(memberType: RGBType, part: PartBlock): AffinityTier {
  if (memberType === part.strongType) return 'strong'
  if (memberType === part.neutralType) return 'neutral'
  return 'weak'
}

export function getStatAffinityTier(statType: RGBType, part: PartBlock): AffinityTier {
  return getAffinityTier(statType, part)
}

function getMultiplier(memberType: RGBType, part: PartBlock): number {
  return AFFINITY_MULTIPLIER[getAffinityTier(memberType, part)]
}

export function calcStatPoint(stat: Stat, part: PartBlock): number {
  return stat.level * getMultiplier(stat.type, part)
}

export function calcPartPointBreakdown(member: Member, part: PartBlock): StatPointBreakdown[] {
  const rows: { label: string; stat: Stat }[] = [
    { label: '외모', stat: member.appearance },
    { label: '보컬', stat: member.vocal },
    { label: '안무', stat: member.choreography },
  ]

  return rows.map(({ label, stat }) => {
    const tier = getAffinityTier(stat.type, part)
    const multiplier = AFFINITY_MULTIPLIER[tier]
    return {
      label,
      stat,
      tier,
      multiplier,
      point: stat.level * multiplier,
    }
  })
}

export function calcPartPoint(member: Member, part: PartBlock): number {
  return calcPartPointBreakdown(member, part).reduce((sum, row) => sum + row.point, 0)
}

export type MatchQuality = 'great' | 'good' | 'neutral'

export function getMatchQuality(member: Member, part: PartBlock): MatchQuality {
  const strongCount = calcPartPointBreakdown(member, part).filter((row) => row.tier === 'strong').length
  if (strongCount >= 2) return 'great'
  if (strongCount === 1) return 'good'
  return 'neutral'
}

export function formatPoint(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function calcSongPoint(members: Map<string, Member>, parts: PartBlock[]): number {
  return parts.reduce((total, part) => {
    if (!part.assignedMemberId) return total
    const member = members.get(part.assignedMemberId)
    if (!member) return total
    return total + calcPartPoint(member, part)
  }, 0)
}
