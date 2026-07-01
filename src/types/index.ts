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
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
  assignedMemberId: string | null
}

export interface Song {
  title: string
  parts: PartBlock[]
}
