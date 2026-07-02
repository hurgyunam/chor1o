import { COMPOSER_TEAMS } from '@/data/composerTeams'
import type { ComposerTeam } from '@/types/composerTeam'

const MIN_PART_COUNT = 7
const MAX_PART_COUNT = 15

/** 작곡 능력(1~100) → 파트 고유밸류(백분율 정수) 범위 */
const PART_VALUE_RANGE_BY_SKILL = [
  { maxSkill: 35, min: 52, max: 82 },
  { maxSkill: 65, min: 72, max: 102 },
  { maxSkill: 100, min: 98, max: 145 },
] as const

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!
}

export function getPartValueRangeForSkill(compositionSkill: number): { min: number; max: number } {
  const tier = PART_VALUE_RANGE_BY_SKILL.find((entry) => compositionSkill <= entry.maxSkill)!
  return { min: tier.min, max: tier.max }
}

export function isLowSkillTeam(compositionSkill: number): boolean {
  return compositionSkill <= 35
}

export function getTeamCostRange(team: ComposerTeam): { min: number; max: number } {
  const { min, max } = getPartValueRangeForSkill(team.compositionSkill)
  return {
    min: MIN_PART_COUNT * min,
    max: MAX_PART_COUNT * max,
  }
}

/** 비용 범위와 겹치는 팀만 후보로 두고, 목표 비용 중심에 가까운 팀일수록 뽑힐 확률을 높인다. */
export function pickTeamForCostRange(costMin: number, costMax: number): ComposerTeam {
  const targetMid = (costMin + costMax) / 2
  const eligible = COMPOSER_TEAMS.filter((team) => {
    const range = getTeamCostRange(team)
    return range.min <= costMax && range.max >= costMin
  })
  const pool = eligible.length > 0 ? eligible : [...COMPOSER_TEAMS]

  const weights = pool.map((team) => {
    const range = getTeamCostRange(team)
    const teamMid = (range.min + range.max) / 2
    return 1 / (1 + Math.abs(teamMid - targetMid) / 200)
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let roll = Math.random() * totalWeight

  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!
    if (roll <= 0) return pool[i]!
  }

  return pickRandom(pool)
}
