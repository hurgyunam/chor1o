<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { DemoSong } from '@/types/demo'
import { useGameStore } from '@/stores/useGameStore'
import { formatDemoDuration } from '@/utils/demoSongGenerator'
import RGBTypeDot from '@/components/RGBTypeDot.vue'

defineProps<{
  demo: DemoSong
}>()

const router = useRouter()
const gameStore = useGameStore()
const { coins } = storeToRefs(gameStore)

function structureTypeLabel(type: DemoSong['structureType']): string {
  return type === 'main' ? '메인 구조' : '특이 구조'
}

function goBack() {
  router.push({ name: 'demos' })
}
</script>

<template>
  <header class="demo-song-header">
    <div class="demo-song-header__top">
      <button type="button" class="demo-song-header__back" @click="goBack">← 데모 목록</button>
      <div class="demo-song-header__coins" aria-label="보유 게임코인">
        <span class="demo-song-header__coins-label">코인</span>
        <span class="demo-song-header__coins-value">{{ coins }}</span>
      </div>
    </div>

    <div class="demo-song-header__info">
      <div class="demo-song-header__team-row">
        <RGBTypeDot :type="demo.teamPrimaryType" :size="12" />
        <span class="demo-song-header__team">{{ demo.teamName }}</span>
        <span class="demo-song-header__skill">작곡 {{ demo.compositionSkill }}</span>
      </div>
      <h1 class="demo-song-header__title">{{ demo.title }}</h1>
      <div class="demo-song-header__meta">
        <span
          class="demo-song-header__badge"
          :class="`demo-song-header__badge--${demo.structureType}`"
        >
          {{ structureTypeLabel(demo.structureType) }}
        </span>
        <span class="demo-song-header__meta-item">{{ formatDemoDuration(demo.totalDuration) }}</span>
        <span class="demo-song-header__meta-item demo-song-header__meta-item--cost">{{ demo.cost }} 코인</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.demo-song-header {
  flex-shrink: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.demo-song-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.demo-song-header__back {
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-b);
  background: transparent;
  border: none;
  cursor: pointer;
}

.demo-song-header__coins {
  display: flex;
  align-items: center;
  gap: 4px;
}

.demo-song-header__coins-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.demo-song-header__coins-value {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-b);
}

.demo-song-header__team-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.demo-song-header__team {
  font-size: 11px;
  color: var(--color-text-muted);
}

.demo-song-header__skill {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.demo-song-header__title {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.demo-song-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.demo-song-header__badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
}

.demo-song-header__badge--main {
  color: var(--color-g);
  background: color-mix(in srgb, var(--color-g) 14%, transparent);
}

.demo-song-header__badge--special {
  color: #e8a04c;
  background: color-mix(in srgb, #e8a04c 14%, transparent);
}

.demo-song-header__meta-item {
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.demo-song-header__meta-item--cost {
  font-weight: 700;
  color: var(--color-b);
}
</style>
