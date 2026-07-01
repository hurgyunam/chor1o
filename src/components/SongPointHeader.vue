<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/useGameStore'
import { useSongStore } from '@/stores/useSongStore'
import { formatPoint, getMemberShareInfos } from '@/utils/pointCalc'

const songStore = useSongStore()
const gameStore = useGameStore()
const { totalPoint, parts, isComplete, songTitle, isConfirmed } = storeToRefs(songStore)
const { coins } = storeToRefs(gameStore)

const canConfirm = computed(() => isComplete.value && !isConfirmed.value)

function onConfirm() {
  songStore.confirmSong()
}

const scoreBump = ref(false)

const assignedCount = computed(
  () => parts.value.filter((part) => part.assignedMemberId !== null).length,
)

const penalizedMemberCount = computed(
  () => getMemberShareInfos(parts.value).filter((info) => info.isPenalized).length,
)

watch(totalPoint, () => {
  scoreBump.value = true
  window.setTimeout(() => {
    scoreBump.value = false
  }, 450)
})
</script>

<template>
  <header class="song-header">
    <div class="song-header__brand">
      <span class="song-header__title">chor1o</span>
      <p class="song-header__formula">
        스탯 레벨 × RGB 상성 × 파트 길이
        <span class="song-header__formula-multipliers">(350% · 100% · 15%)</span>
      </p>
      <p v-if="penalizedMemberCount > 0" class="song-header__penalty">
        비중 50% 초과 멤버 {{ penalizedMemberCount }}명 반감 적용
      </p>
      <div class="song-header__song-row">
        <span class="song-header__song-title">곡제목: {{ songTitle }}</span>
        <button
          type="button"
          class="song-header__confirm"
          :class="{
            'song-header__confirm--active': canConfirm,
            'song-header__confirm--confirmed': isConfirmed,
          }"
          :disabled="!canConfirm"
          @click="onConfirm"
        >
          {{ isConfirmed ? '확정됨' : '확정' }}
        </button>
      </div>
    </div>

    <div class="song-header__score" :class="{ 'song-header__score--complete': isComplete }">
      <div class="song-header__coins" aria-label="보유 게임코인">
        <span class="song-header__coins-label">코인</span>
        <span class="song-header__coins-value">{{ coins }}</span>
      </div>
      <span class="song-header__score-label">곡 포인트</span>
      <span
        class="song-header__score-value"
        :class="{ 'song-header__score-value--bump': scoreBump }"
      >
        {{ formatPoint(totalPoint) }}
      </span>
      <span class="song-header__score-meta">{{ assignedCount }} / {{ parts.length }} 파트</span>
    </div>
  </header>
</template>

<style scoped>
.song-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.song-header__brand {
  min-width: 0;
}

.song-header__title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
  line-height: 1.2;
}

.song-header__formula {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.song-header__formula-multipliers {
  font-variant-numeric: tabular-nums;
}

.song-header__penalty {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 600;
  color: #e8a04c;
}

.song-header__song-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  min-width: 0;
}

.song-header__song-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-header__confirm {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  cursor: not-allowed;
  opacity: 0.45;
  transition: opacity 0.15s, background-color 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
}

.song-header__confirm--active {
  opacity: 1;
  color: var(--color-bg);
  background: var(--color-g);
  border-color: var(--color-g);
  cursor: pointer;
}

.song-header__confirm--active:active {
  transform: scale(0.96);
}

.song-header__confirm--confirmed {
  opacity: 1;
  color: var(--color-g);
  background: color-mix(in srgb, var(--color-g) 12%, var(--color-surface));
  border-color: var(--color-g);
  cursor: default;
}

.song-header__confirm:disabled:not(.song-header__confirm--active):not(.song-header__confirm--confirmed) {
  cursor: not-allowed;
}

.song-header__score {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.song-header__score--complete {
  border-color: var(--color-g);
  background: color-mix(in srgb, var(--color-g) 10%, var(--color-surface));
}

.song-header__coins {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.song-header__coins-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.song-header__coins-value {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-b);
}

.song-header__score-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.song-header__score-value {
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--color-text);
}

.song-header__score-value--bump {
  animation: score-punch 0.42s cubic-bezier(0.34, 1.4, 0.64, 1);
  color: var(--color-g);
}

.song-header__score-meta {
  font-size: 10px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
