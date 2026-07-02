import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DemoSong } from '@/types/demo'
import { generateDemoSong, DEMO_COST_THEORETICAL_MIN, DEMO_COST_THEORETICAL_MAX } from '@/utils/demoSongGenerator'
import { useGameStore } from '@/stores/useGameStore'
import { addPurchasedSong, isSongPurchased } from '@/utils/songsStorage'

const MIN_COST = DEMO_COST_THEORETICAL_MIN
const MAX_COST = DEMO_COST_THEORETICAL_MAX
const UPLOAD_INTERVAL_MS = 1400
const DEFAULT_COST_MIN = 500
const DEFAULT_COST_MAX = 1600

export const useDemoStore = defineStore('demo', () => {
  const demos = ref<DemoSong[]>([])
  const isExploring = ref(false)
  const costMin = ref(DEFAULT_COST_MIN)
  const costMax = ref(DEFAULT_COST_MAX)

  let uploadTimer: ReturnType<typeof setTimeout> | null = null

  const canExplore = computed(() => costMin.value <= costMax.value)

  function clearUploadTimer() {
    if (uploadTimer !== null) {
      clearTimeout(uploadTimer)
      uploadTimer = null
    }
  }

  function scheduleNextUpload() {
    clearUploadTimer()

    uploadTimer = setTimeout(() => {
      if (!isExploring.value) return

      const demo = generateDemoSong({
        costMin: costMin.value,
        costMax: costMax.value,
      })
      demos.value = [...demos.value, demo]

      scheduleNextUpload()
    }, UPLOAD_INTERVAL_MS)
  }

  function startExplore() {
    if (isExploring.value || !canExplore.value) return

    isExploring.value = true
    demos.value = []
    scheduleNextUpload()
  }

  function cancelExplore() {
    isExploring.value = false
    clearUploadTimer()
  }

  function setCostMin(value: number) {
    costMin.value = Math.min(MAX_COST, Math.max(MIN_COST, value))
    if (costMin.value > costMax.value) {
      costMax.value = costMin.value
    }
  }

  function setCostMax(value: number) {
    costMax.value = Math.min(MAX_COST, Math.max(MIN_COST, value))
    if (costMax.value < costMin.value) {
      costMin.value = costMax.value
    }
  }

  function getDemoById(id: string): DemoSong | undefined {
    return demos.value.find((demo) => demo.id === id)
  }

  function purchaseDemo(demoId: string): boolean {
    const demo = getDemoById(demoId)
    if (!demo || isSongPurchased(demoId)) return false

    const gameStore = useGameStore()
    if (!gameStore.spendCoins(demo.cost)) return false

    addPurchasedSong(demo)
    demos.value = demos.value.filter((item) => item.id !== demoId)
    return true
  }

  function canPurchaseDemo(demo: DemoSong): boolean {
    if (isSongPurchased(demo.id)) return false
    const gameStore = useGameStore()
    return gameStore.canAfford(demo.cost)
  }

  return {
    demos,
    isExploring,
    costMin,
    costMax,
    canExplore,
    startExplore,
    cancelExplore,
    setCostMin,
    setCostMax,
    getDemoById,
    purchaseDemo,
    canPurchaseDemo,
    minCostLimit: MIN_COST,
    maxCostLimit: MAX_COST,
  }
})
