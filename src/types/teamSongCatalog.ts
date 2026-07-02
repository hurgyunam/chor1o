import type { RGBType } from '@/types'
import type { DemoPartSegment, DemoStructureType } from '@/types/demo'

export interface CatalogPartAffinity {
  strongType: RGBType
  neutralType: RGBType
  weakType: RGBType
}

/** 작곡팀별 고정 카탈로그 곡 — 데모 탐색·음원차트가 동일 ID·제목·구조를 공유 */
export interface TeamCatalogSong {
  id: string
  teamId: string
  title: string
  structureType: DemoStructureType
  segments: readonly DemoPartSegment[]
  partAffinities: readonly CatalogPartAffinity[]
  /** 음원차트 순위용 고정 포인트 */
  chartPoint: number
}
