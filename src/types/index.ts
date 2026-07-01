export type RGBType = 'R' | 'G' | 'B'

export interface Stat {
  type: RGBType
  level: number // 1 ~ 10
}

export interface Member {
  id: string
  name: string
  imageUrl: string
  appearance: Stat
  vocal: Stat
  choreography: Stat
}

export type PartName =
  | 'intro'
  | 'part1-1'
  | 'part1-2'
  | 'chorus1'
  | 'part2-1'
  | 'part2-2'
  | 'chorus2'
  | 'bridge'
  | 'chorus3'

export interface PartBlock {
  name: PartName
  label: string
  /** 파트 길이(초). 포인트 계산 시 배율로 곱해진다. */
  duration: number
  /** 파트 고유 배율. 멤버 상성 포인트에 곱해진다. 리롤 시 변동한다. */
  bonusMultiplier: number
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
  assignedMemberId: string | null
}

export interface Song {
  title: string
  parts: PartBlock[]
}
