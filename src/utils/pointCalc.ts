import type { Member, PartBlock, RGBType, Stat } from '@/types'

export type AffinityTier = 'strong' | 'neutral' | 'weak'

export const AFFINITY_MULTIPLIER: Record<AffinityTier, number> = {
  strong: 2.0,
  neutral: 1.0,
  weak: 0.5,
}

export const AFFINITY_LABEL: Record<AffinityTier, string> = {
  strong: '200%',
  neutral: '100%',
  weak: '50%',
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

function getMultiplier(memberType: RGBType, part: PartBlock): number {
  if (memberType === part.strongType) return AFFINITY_MULTIPLIER.strong
  if (memberType === part.neutralType) return AFFINITY_MULTIPLIER.neutral
  return AFFINITY_MULTIPLIER.weak
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
    const multiplier = getMultiplier(stat.type, part)
    return {
      label,
      stat,
      multiplier,
      point: stat.level * multiplier,
    }
  })
}

export function calcPartPoint(member: Member, part: PartBlock): number {
  return calcPartPointBreakdown(member, part).reduce((sum, row) => sum + row.point, 0)
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
