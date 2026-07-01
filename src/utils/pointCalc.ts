import type { Member, PartBlock, RGBType } from '@/types'

const AFFINITY_MULTIPLIER: Record<'strong' | 'neutral' | 'weak', number> = {
  strong: 2.0,
  neutral: 1.0,
  weak: 0.5,
}

function getMultiplier(memberType: RGBType, part: PartBlock): number {
  if (memberType === part.strongType) return AFFINITY_MULTIPLIER.strong
  if (memberType === part.neutralType) return AFFINITY_MULTIPLIER.neutral
  return AFFINITY_MULTIPLIER.weak
}

export function calcPartPoint(member: Member, part: PartBlock): number {
  const appearancePoint = member.appearance.level * getMultiplier(member.appearance.type, part)
  const vocalPoint = member.vocal.level * getMultiplier(member.vocal.type, part)
  const choreoPoint = member.choreography.level * getMultiplier(member.choreography.type, part)
  return appearancePoint + vocalPoint + choreoPoint
}

export function calcSongPoint(members: Map<string, Member>, parts: PartBlock[]): number {
  return parts.reduce((total, part) => {
    if (!part.assignedMemberId) return total
    const member = members.get(part.assignedMemberId)
    if (!member) return total
    return total + calcPartPoint(member, part)
  }, 0)
}
