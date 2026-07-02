import type { RGBType } from '@/types'

/** 고정 작곡팀 프로필 — 작곡 능력(1~100)과 주 특성(R·G·B)이 곡 품질·파트 성향을 결정한다. */
export interface ComposerTeam {
  id: string
  name: string
  /** 작곡 능력. 높을수록 파트 고유밸류·곡 비용이 높은 편 */
  compositionSkill: number
  /** 주로 다루는 특성 — 파트 strongType에 70% 확률로 반영 */
  primaryType: RGBType
}
