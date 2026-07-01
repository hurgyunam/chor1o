import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartName } from '@/types'
import { isChorusPart } from '@/utils/partKinds'

export const PART_REROLL_COST = 10
export const CHORUS_REROLL_COST = 25
const INITIAL_COINS = 100

export function getPartRerollCost(partName: PartName): number {
  return isChorusPart(partName) ? CHORUS_REROLL_COST : PART_REROLL_COST
}

export const useGameStore = defineStore('game', () => {
  const coins = ref(INITIAL_COINS)

  function canAfford(amount: number): boolean {
    return coins.value >= amount
  }

  function spendCoins(amount: number): boolean {
    if (!canAfford(amount)) return false
    coins.value -= amount
    return true
  }

  return {
    coins,
    canAfford,
    spendCoins,
  }
})
