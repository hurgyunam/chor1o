import type { RGBType } from '@/types'

export type DemoPartKind = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'

export type DemoStructureType = 'main' | 'special'

export interface DemoPartSegment {
  kind: DemoPartKind
  label: string
  duration: number
}

export interface DemoPartBlock {
  id: string
  label: string
  duration: number
  bonusMultiplier: number
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
}

export interface DemoSong {
  id: string
  /** 카탈로그 곡 ID — 데모·차트·구매 후에도 동일 곡 식별 */
  catalogSongId: string
  teamId: string
  teamName: string
  teamPrimaryType: DemoPartBlock['strongType']
  compositionSkill: number
  title: string
  structureType: DemoStructureType
  segments: DemoPartSegment[]
  parts: DemoPartBlock[]
  totalDuration: number
  cost: number
}

export interface GenerateDemoSongOptions {
  costMin: number
  costMax: number
  structureType?: DemoStructureType
}
