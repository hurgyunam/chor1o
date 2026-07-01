<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSongStore } from '@/stores/useSongStore'
import { formatPoint } from '@/utils/pointCalc'

const songStore = useSongStore()
const { totalPoint, parts, isComplete } = storeToRefs(songStore)

const assignedCount = computed(
  () => parts.value.filter((part) => part.assignedMemberId !== null).length,
)
</script>

<template>
  <header class="song-header">
    <div class="song-header__brand">
      <span class="song-header__title">chor1o</span>
      <p class="song-header__formula">
        스탯 레벨 × RGB 상성
        <span class="song-header__formula-multipliers">(200% · 100% · 50%)</span>
      </p>
    </div>

    <div class="song-header__score" :class="{ 'song-header__score--complete': isComplete }">
      <span class="song-header__score-label">곡 포인트</span>
      <span class="song-header__score-value">{{ formatPoint(totalPoint) }}</span>
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

.song-header__score-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.song-header__score-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--color-text);
}

.song-header__score-meta {
  font-size: 10px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
