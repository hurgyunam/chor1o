<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDemoStore } from '@/stores/useDemoStore'
import { useGameStore } from '@/stores/useGameStore'
import { formatDemoDuration } from '@/utils/demoSongGenerator'
import type { DemoSong } from '@/types/demo'
import RGBTypeDot from '@/components/RGBTypeDot.vue'

const router = useRouter()
const demoStore = useDemoStore()
const gameStore = useGameStore()
const { demos, isExploring, costMin, costMax, canExplore } = storeToRefs(demoStore)
const { coins } = storeToRefs(gameStore)

const showEmptyLoading = computed(() => isExploring.value && demos.value.length === 0)
const showTableLoading = computed(() => isExploring.value && demos.value.length > 0)

function onExploreClick() {
  if (isExploring.value) {
    demoStore.cancelExplore()
    return
  }
  demoStore.startExplore()
}

function onViewStructure(demo: DemoSong) {
  router.push({ name: 'demo-song', params: { id: demo.id } })
}

function onPurchase(demo: DemoSong) {
  demoStore.purchaseDemo(demo.id)
}

function canPurchase(demo: DemoSong): boolean {
  return demoStore.canPurchaseDemo(demo)
}
</script>

<template>
  <div class="demos-shell">
    <header class="demos-header">
      <div class="demos-header__brand">
        <div class="demos-header__brand-row">
          <div>
            <span class="demos-header__title">chor1o</span>
            <p class="demos-header__subtitle">작곡팀 데모 탐색</p>
          </div>
          <div class="demos-header__coins" aria-label="보유 게임코인">
            <span class="demos-header__coins-label">코인</span>
            <span class="demos-header__coins-value">{{ coins }}</span>
          </div>
        </div>
      </div>

      <div class="demos-header__controls">
        <div class="cost-range">
          <div class="cost-range__labels">
            <span class="cost-range__label">지불 비용 범위</span>
            <span class="cost-range__value">{{ costMin }} ~ {{ costMax }} 코인</span>
          </div>

          <div class="cost-range__sliders">
            <label class="cost-range__field">
              <span class="cost-range__field-label">최소</span>
              <input
                type="range"
                class="cost-range__slider"
                :min="demoStore.minCostLimit"
                :max="costMax"
                :value="costMin"
                @input="demoStore.setCostMin(Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <label class="cost-range__field">
              <span class="cost-range__field-label">최대</span>
              <input
                type="range"
                class="cost-range__slider"
                :min="costMin"
                :max="demoStore.maxCostLimit"
                :value="costMax"
                @input="demoStore.setCostMax(Number(($event.target as HTMLInputElement).value))"
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          class="explore-btn"
          :class="{ 'explore-btn--cancel': isExploring }"
          :disabled="!isExploring && !canExplore"
          @click="onExploreClick"
        >
          {{ isExploring ? '탐색 취소' : '탐색' }}
        </button>
      </div>
    </header>

    <main class="demos-main">
      <div class="demo-table-wrap">
        <table class="demo-table" aria-label="작곡팀 데모 목록">
          <thead>
            <tr>
              <th scope="col">작곡팀</th>
              <th scope="col">곡</th>
              <th scope="col">길이</th>
              <th scope="col">비용</th>
              <th scope="col">구조보기</th>
              <th scope="col">구매</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!isExploring && demos.length === 0">
              <td colspan="6" class="demo-table__status-cell">
                <div class="demo-table__empty">탐색 버튼을 눌러 데모를 찾아보세요.</div>
              </td>
            </tr>

            <tr v-if="showEmptyLoading">
              <td colspan="6" class="demo-table__status-cell">
                <div class="demo-table__loading">
                  <span class="demo-table__spinner" aria-hidden="true" />
                  <span>작곡팀 데모를 탐색하는 중…</span>
                </div>
              </td>
            </tr>

            <tr v-for="demo in demos" :key="demo.id">
              <td class="demo-table__team">
                <div class="demo-table__team-cell">
                  <RGBTypeDot :type="demo.teamPrimaryType" :size="10" />
                  <span class="demo-table__team-name">{{ demo.teamName }}</span>
                  <span class="demo-table__team-skill">{{ demo.compositionSkill }}</span>
                </div>
              </td>
              <td class="demo-table__title">{{ demo.title }}</td>
              <td class="demo-table__duration">{{ formatDemoDuration(demo.totalDuration) }}</td>
              <td class="demo-table__cost">{{ demo.cost }}</td>
              <td class="demo-table__action">
                <button
                  type="button"
                  class="demo-table__btn demo-table__btn--structure"
                  @click="onViewStructure(demo)"
                >
                  구조보기
                </button>
              </td>
              <td class="demo-table__action">
                <button
                  type="button"
                  class="demo-table__btn demo-table__btn--purchase"
                  :disabled="!canPurchase(demo)"
                  @click="onPurchase(demo)"
                >
                  구매
                </button>
              </td>
            </tr>

            <tr v-if="showTableLoading">
              <td colspan="6" class="demo-table__status-cell">
                <div class="demo-table__loading demo-table__loading--inline">
                  <span class="demo-table__spinner" aria-hidden="true" />
                  <span>추가 데모 탐색 중…</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.demos-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.demos-header {
  flex-shrink: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.demos-header__brand {
  margin-bottom: 12px;
}

.demos-header__brand-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.demos-header__coins {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.demos-header__coins-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.demos-header__coins-value {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-b);
}

.demos-header__title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.demos-header__subtitle {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.demos-header__controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cost-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.cost-range__labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cost-range__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.cost-range__value {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-b);
}

.cost-range__sliders {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cost-range__field {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 8px;
}

.cost-range__field-label {
  font-size: 10px;
  color: var(--color-text-muted);
}

.cost-range__slider {
  width: 100%;
  accent-color: var(--color-b);
}

.explore-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--color-g);
  border: 1px solid var(--color-g);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s, background-color 0.15s, border-color 0.15s;
}

.explore-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.explore-btn--cancel {
  color: var(--color-text);
  background: var(--color-surface);
  border-color: #e8a04c;
}

.explore-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.demos-main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px 10px 16px;
}

.demo-table-wrap {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  background: var(--color-surface);
}

.demo-table {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  font-size: 11px;
}

.demo-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: color-mix(in srgb, var(--color-surface) 88%, var(--color-bg));
}

.demo-table th {
  padding: 8px 6px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.demo-table td {
  padding: 10px 6px;
  vertical-align: top;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
}

.demo-table tbody tr:last-child td {
  border-bottom: none;
}

.demo-table__status-cell {
  padding: 0 !important;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
}

.demo-table__empty,
.demo-table__loading {
  width: 100%;
  padding: 28px 12px;
  text-align: center;
  color: var(--color-text-muted);
  box-sizing: border-box;
}

.demo-table__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.demo-table__loading--inline {
  padding: 14px 12px;
  flex-direction: row;
}

.demo-table__spinner {
  width: 22px;
  height: 22px;
  border: 2px solid color-mix(in srgb, var(--color-b) 25%, transparent);
  border-top-color: var(--color-b);
  border-radius: 50%;
  animation: demo-spin 0.8s linear infinite;
}

.demo-table__team {
  font-weight: 600;
  white-space: nowrap;
}

.demo-table__team-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.demo-table__team-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-table__team-skill {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.demo-table__title {
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.demo-table__duration,
.demo-table__cost {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.demo-table__cost {
  font-weight: 700;
  color: var(--color-b);
}

.demo-table__action {
  padding: 8px 6px;
  vertical-align: middle;
  white-space: nowrap;
}

.demo-table__btn {
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s, background-color 0.15s, border-color 0.15s, color 0.15s;
}

.demo-table__btn:active {
  transform: scale(0.96);
}

.demo-table__btn--structure {
  color: var(--color-text);
  background: var(--color-bg);
  border-color: var(--color-border);
}

.demo-table__btn--structure:hover,
.demo-table__btn--structure:active {
  border-color: var(--color-b);
  color: var(--color-b);
}

.demo-table__btn--purchase {
  color: var(--color-bg);
  background: var(--color-g);
  border-color: var(--color-g);
}

.demo-table__btn--purchase:hover:not(:disabled),
.demo-table__btn--purchase:active:not(:disabled) {
  background: color-mix(in srgb, var(--color-g) 85%, white);
  border-color: color-mix(in srgb, var(--color-g) 85%, white);
}

.demo-table__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<style>
@keyframes demo-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
