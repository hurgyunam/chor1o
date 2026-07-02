import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartName } from '@/types'
import { isChorusPart } from '@/utils/partKinds'
import { loadGameState, saveGameState } from '@/utils/gameStorage'

export const PART_REROLL_COST = 10
export const CHORUS_REROLL_COST = 25
export const INITIAL_COINS = 100

export function getPartRerollCost(partName: PartName): number {
  return isChorusPart(partName) ? CHORUS_REROLL_COST : PART_REROLL_COST
}

function loadInitialCoins(): number {
  const saved = loadGameState()
  if (saved && saved.coins >= 0) return saved.coins
  return INITIAL_COINS
}

export const useGameStore = defineStore('game', () => {
  const coins = ref(loadInitialCoins())

  function persistGame() {
    saveGameState({ coins: coins.value })
  }

  function canAfford(amount: number): boolean {
    return coins.value >= amount
  }

  function spendCoins(amount: number): boolean {
    if (!canAfford(amount)) return false
    coins.value -= amount
    persistGame()
    return true
  }

  return {
    coins,
    canAfford,
    spendCoins,
    persistGame,
  }
})
