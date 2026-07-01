<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getChartForSong } from '@/data/songChart'
import { buildChartTableRows } from '@/utils/songChartRank'
import { formatPoint } from '@/utils/pointCalc'

const props = defineProps<{
  songTitle: string
  playerPoint: number
}>()

const emit = defineEmits<{
  close: []
}>()

const playerRowRef = ref<HTMLElement | null>(null)
const tableBodyRef = ref<HTMLElement | null>(null)

const chart = computed(() => getChartForSong(props.songTitle))

const tableRows = computed(() => {
  if (!chart.value) return []
  return buildChartTableRows(chart.value.entries, props.playerPoint, props.songTitle)
})

const playerRank = computed(() => {
  const row = tableRows.value.find((r) => r.isPlayer)
  return row?.rank ?? null
})

const rankSummary = computed(() => {
  if (!chart.value || playerRank.value === null) return null
  const total = chart.value.entries.length
  if (props.playerPoint <= 0) return '파트를 배치하면 순위가 표시됩니다'
  if (playerRank.value === 1) return `현재 1위! (${total}곡 중)`
  return `현재 예상 ${playerRank.value}위 (${total + 1}곡 중)`
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

async function scrollToPlayerRow() {
  await nextTick()
  const row = playerRowRef.value
  const body = tableBodyRef.value
  if (!row || !body) return

  const rowTop = row.offsetTop
  const rowHeight = row.offsetHeight
  const bodyHeight = body.clientHeight
  body.scrollTop = rowTop - bodyHeight / 2 + rowHeight / 2
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  scrollToPlayerRow()
})

watch(
  () => props.playerPoint,
  () => scrollToPlayerRow(),
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="song-chart" @click.self="emit('close')">
      <div
        class="song-chart__panel"
        role="dialog"
        aria-modal="true"
        aria-label="음원차트 순위"
      >
        <div class="song-chart__handle" aria-hidden="true" />

        <header class="song-chart__header">
          <div class="song-chart__header-text">
            <h2 class="song-chart__title">{{ chart?.chartName ?? '음원차트' }}</h2>
            <p class="song-chart__subtitle">{{ songTitle }}</p>
          </div>
          <button
            type="button"
            class="song-chart__close"
            aria-label="닫기"
            @click="emit('close')"
          >
            닫기
          </button>
        </header>

        <p v-if="rankSummary" class="song-chart__summary">{{ rankSummary }}</p>

        <div v-if="chart" ref="tableBodyRef" class="song-chart__body">
          <table class="song-chart__table">
            <thead>
              <tr>
                <th scope="col">순위</th>
                <th scope="col">곡</th>
                <th scope="col">포인트</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in tableRows"
                :key="`${row.kind}-${row.rank}-${index}`"
                :ref="row.isPlayer ? (el) => { playerRowRef = el as HTMLElement } : undefined"
                class="song-chart__row"
                :class="{
                  'song-chart__row--player': row.isPlayer,
                  'song-chart__row--top3': !row.isPlayer && row.rank <= 3,
                }"
              >
                <td class="song-chart__rank">
                  <span v-if="row.isPlayer" class="song-chart__player-badge">▶</span>
                  {{ row.rank }}
                </td>
                <td class="song-chart__name">{{ row.songName }}</td>
                <td class="song-chart__point">{{ formatPoint(row.point) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="song-chart__empty">
          이 곡의 차트 데이터가 아직 없습니다.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.song-chart {
  position: fixed;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  animation: chart-fade-in 0.2s ease;
}

.song-chart__panel {
  width: 100%;
  max-width: 430px;
  max-height: min(78vh, 560px);
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  animation: chart-slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.song-chart__handle {
  flex-shrink: 0;
  width: 36px;
  height: 4px;
  margin: 10px auto 0;
  border-radius: 999px;
  background: var(--color-border);
}

.song-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 4px;
}

.song-chart__header-text {
  min-width: 0;
}

.song-chart__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.song-chart__subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.song-chart__close {
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.song-chart__summary {
  padding: 0 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-g);
}

.song-chart__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 12px 20px;
  -webkit-overflow-scrolling: touch;
}

.song-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.song-chart__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 6px;
  font-size: 10px;
  font-weight: 600;
  text-align: left;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.song-chart__table th:last-child {
  text-align: right;
}

.song-chart__row td {
  padding: 9px 6px;
  font-size: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
}

.song-chart__rank {
  width: 44px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.song-chart__name {
  font-weight: 600;
  color: var(--color-text);
}

.song-chart__point {
  text-align: right;
  font-weight: 700;
  color: var(--color-text);
}

.song-chart__row--top3 .song-chart__rank {
  color: var(--color-b);
}

.song-chart__row--player {
  background: color-mix(in srgb, var(--color-g) 14%, var(--color-surface));
  box-shadow: inset 3px 0 0 var(--color-g);
  animation: player-row-pulse 1.2s ease-in-out 2;
}

.song-chart__row--player td {
  border-bottom-color: var(--color-g);
}

.song-chart__row--player .song-chart__rank,
.song-chart__row--player .song-chart__name,
.song-chart__row--player .song-chart__point {
  color: var(--color-g);
}

.song-chart__player-badge {
  margin-right: 2px;
  font-size: 9px;
}

.song-chart__empty {
  padding: 24px 16px;
  font-size: 12px;
  text-align: center;
  color: var(--color-text-muted);
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes chart-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes player-row-pulse {
  0%,
  100% {
    background: color-mix(in srgb, var(--color-g) 14%, var(--color-surface));
  }
  50% {
    background: color-mix(in srgb, var(--color-g) 24%, var(--color-surface));
  }
}
</style>
