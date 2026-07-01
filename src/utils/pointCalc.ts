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
  return stat.level * getMultiplier(stat.type, part) * part.duration * part.bonusMultiplier
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
      point: stat.level * multiplier * part.duration * part.bonusMultiplier,
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

/** 전체 곡 길이 대비 멤버 비중이 이 값을 초과하면 반감 패널티 */
export const MEMBER_SHARE_PENALTY_THRESHOLD = 0.5

export const MEMBER_OVERLOAD_PENALTY_MULTIPLIER = 0.5

export interface MemberShareInfo {
  memberId: string
  share: number
  isPenalized: boolean
}

export function formatSharePercent(share: number): string {
  return `${Math.round(share * 100)}%`
}

export function getMemberShare(memberId: string, parts: PartBlock[]): number {
  return calcMemberDurationShares(parts).get(memberId) ?? 0
}

export function calcTotalSongDuration(parts: PartBlock[]): number {
  return parts.reduce((sum, part) => sum + part.duration, 0)
}

export function calcMemberDurationShares(parts: PartBlock[]): Map<string, number> {
  const totalDuration = calcTotalSongDuration(parts)
  if (totalDuration === 0) return new Map()

  const memberDuration = new Map<string, number>()
  for (const part of parts) {
    if (!part.assignedMemberId) continue
    const id = part.assignedMemberId
    memberDuration.set(id, (memberDuration.get(id) ?? 0) + part.duration)
  }

  const shares = new Map<string, number>()
  for (const [id, duration] of memberDuration) {
    shares.set(id, duration / totalDuration)
  }
  return shares
}

export function getMemberShareInfos(parts: PartBlock[]): MemberShareInfo[] {
  const shares = calcMemberDurationShares(parts)
  return [...shares.entries()].map(([memberId, share]) => ({
    memberId,
    share,
    isPenalized: share > MEMBER_SHARE_PENALTY_THRESHOLD,
  }))
}

export function getMemberOverloadMultiplier(memberId: string, parts: PartBlock[]): number {
  const share = calcMemberDurationShares(parts).get(memberId) ?? 0
  return share > MEMBER_SHARE_PENALTY_THRESHOLD ? MEMBER_OVERLOAD_PENALTY_MULTIPLIER : 1
}

export function calcPartPointBreakdownWithPenalty(
  member: Member,
  part: PartBlock,
  parts: PartBlock[],
): StatPointBreakdown[] {
  const penalty = part.assignedMemberId
    ? getMemberOverloadMultiplier(part.assignedMemberId, parts)
    : 1

  return calcPartPointBreakdown(member, part).map((row) => ({
    ...row,
    point: row.point * penalty,
  }))
}

export function calcPartPointWithPenalty(member: Member, part: PartBlock, parts: PartBlock[]): number {
  return calcPartPointBreakdownWithPenalty(member, part, parts).reduce((sum, row) => sum + row.point, 0)
}

export function calcSongPoint(members: Map<string, Member>, parts: PartBlock[]): number {
  return parts.reduce((total, part) => {
    if (!part.assignedMemberId) return total
    const member = members.get(part.assignedMemberId)
    if (!member) return total
    return total + calcPartPointWithPenalty(member, part, parts)
  }, 0)
}
