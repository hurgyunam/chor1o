<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Member, PartBlock as PartBlockType } from '@/types'
import PartAffinitySpec from '@/components/PartAffinitySpec.vue'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { useDragStore } from '@/stores/useDragStore'
import { getPartRerollCost, useGameStore } from '@/stores/useGameStore'
import { useMemberStore } from '@/stores/useMemberStore'
import { useSongStore } from '@/stores/useSongStore'
import { useDraggable } from '@/composables/useDraggable'
import { isChorusPart } from '@/utils/partKinds'
import {
  calcPartPointBreakdownWithPenalty,
  calcPartPointWithPenalty,
  formatPoint,
  getMatchQuality,
  getMemberOverloadMultiplier,
} from '@/utils/pointCalc'
import { formatPartBonus } from '@/utils/partBonus'
import { getRgbColor } from '@/utils/rgb'

const props = defineProps<{
  part: PartBlockType
  member: Member | null
}>()

const dragStore = useDragStore()
const memberStore = useMemberStore()
const songStore = useSongStore()
const gameStore = useGameStore()
const { isDragging, hoveredPartName } = storeToRefs(dragStore)
const { coins } = storeToRefs(gameStore)
const { parts } = storeToRefs(songStore)

const landing = ref(false)
const landingGreat = ref(false)
const pointPop = ref<number | null>(null)
const totalPop = ref(false)
const affinityFlash = ref(false)
const bonusFlash = ref(false)
const bonusPop = ref<number | null>(null)

const isReturnTarget = computed(
  () =>
    isDragging.value &&
    hoveredPartName.value === props.part.name &&
    dragStore.source?.kind === 'part-block' &&
    dragStore.source.partName === props.part.name,
)

const isHoverTarget = computed(
  () =>
    isDragging.value &&
    hoveredPartName.value === props.part.name &&
    !isReturnTarget.value,
)

const previewMatch = computed(() => {
  if (!isHoverTarget.value || !dragStore.source) return null
  const member = memberStore.getMemberById(dragStore.source.memberId)
  if (!member) return null
  return getMatchQuality(member, props.part)
})

const pointBreakdown = computed(() =>
  props.member ? calcPartPointBreakdownWithPenalty(props.member, props.part, parts.value) : [],
)

const totalPoint = computed(() =>
  props.member ? calcPartPointWithPenalty(props.member, props.part, parts.value) : 0,
)

const hasOverloadPenalty = computed(() =>
  props.member
    ? getMemberOverloadMultiplier(props.member.id, parts.value) < 1
    : false,
)

const assignedDraggable = useDraggable({
  getSource: () => ({
    kind: 'part-block',
    partName: props.part.name,
    memberId: props.member!.id,
  }),
  disabled: computed(() => !props.member),
})

const isMemberDragging = computed(
  () =>
    isDragging.value &&
    dragStore.source?.kind === 'part-block' &&
    dragStore.source.partName === props.part.name,
)

const rerollCost = computed(() => getPartRerollCost(props.part.name))

const isChorusReroll = computed(() => isChorusPart(props.part.name))

const canReroll = computed(
  () => !isDragging.value && coins.value >= rerollCost.value,
)

function onReroll() {
  songStore.rerollPartAffinity(props.part.name)
}

function onDrop() {
  const src = dragStore.source
  if (!src) return
  if (src.kind === 'part-block' && src.partName === props.part.name) return
  if (src.kind === 'part-block' && src.partName !== props.part.name) {
    songStore.unassignMember(src.partName)
  }
  if (src.kind === 'member-list' || src.kind === 'part-block') {
    songStore.assignMember(props.part.name, src.memberId)
  }
}

watch(
  () => songStore.assignFeedback?.seq,
  () => {
    const feedback = songStore.assignFeedback
    if (!feedback || feedback.partName !== props.part.name) return

    landing.value = true
    landingGreat.value = feedback.strongCount >= 2
    pointPop.value = feedback.point
    totalPop.value = true

    window.setTimeout(() => {
      landing.value = false
      landingGreat.value = false
    }, 520)

    window.setTimeout(() => {
      pointPop.value = null
    }, 900)

    window.setTimeout(() => {
      totalPop.value = false
    }, 480)
  },
)

watch(
  () => songStore.rerollFeedback?.seq,
  () => {
    const feedback = songStore.rerollFeedback
    if (!feedback) return
    const shouldFlash = feedback.chorusGroup
      ? isChorusPart(props.part.name)
      : feedback.partName === props.part.name
    if (!shouldFlash) return

    affinityFlash.value = true
    window.setTimeout(() => {
      affinityFlash.value = false
    }, 520)

    const bonusChange = feedback.bonusChanges.find((change) => change.partName === props.part.name)
    if (!bonusChange || bonusChange.delta === 0) return

    bonusFlash.value = true
    bonusPop.value = bonusChange.delta
    totalPop.value = true

    window.setTimeout(() => {
      bonusFlash.value = false
    }, 520)

    window.setTimeout(() => {
      bonusPop.value = null
    }, 900)

    window.setTimeout(() => {
      totalPop.value = false
    }, 480)
  },
)
</script>

<template>
  <div
    class="part-block"
    :class="{
      'part-block--drop-target': isHoverTarget,
      'part-block--return-target': isReturnTarget,
      'part-block--match-good': isHoverTarget && previewMatch === 'good',
      'part-block--match-great': isHoverTarget && previewMatch === 'great',
      'part-block--filled': !!member,
      'part-block--landing': landing,
      'part-block--landing-great': landingGreat,
    }"
    data-drop-zone="part"
    :data-part-name="part.name"
    @chor1o-drop="onDrop"
  >
    <span class="part-block__label">
      {{ part.label }}
      <span class="part-block__duration">{{ part.duration }}초</span>
      <span
        class="part-block__bonus"
        :class="{
          'part-block__bonus--flash': bonusFlash,
          'part-block__bonus--high': part.bonusMultiplier > 1,
          'part-block__bonus--low': part.bonusMultiplier < 1,
        }"
      >
        고유 {{ formatPartBonus(part.bonusMultiplier) }}
      </span>
    </span>
    <PartAffinitySpec :part="part" :flash="affinityFlash" />

    <div
      v-if="member"
      class="part-block__body"
      :class="{ 'part-block__body--reveal': landing }"
    >
      <div
        class="part-block__member"
        :class="{ 'part-block__member--dragging': isMemberDragging }"
        aria-label="드래그하여 다른 파트로 이동"
        @pointerdown="assignedDraggable.onPointerDown"
      >
        <span class="part-block__handle" aria-hidden="true">
          <svg class="part-block__grip" viewBox="0 0 16 10">
            <circle cx="4" cy="2" r="1.25" />
            <circle cx="12" cy="2" r="1.25" />
            <circle cx="4" cy="5" r="1.25" />
            <circle cx="12" cy="5" r="1.25" />
            <circle cx="4" cy="8" r="1.25" />
            <circle cx="12" cy="8" r="1.25" />
          </svg>
          <span class="part-block__handle-label">이동</span>
        </span>
        <div class="part-block__member-main">
          <div class="part-block__face">
            <img
              v-if="member.imageUrl"
              :src="member.imageUrl"
              :alt="`${member.name} 프로필`"
              class="part-block__image"
            />
            <span v-else class="part-block__initial">{{ member.name.charAt(0) }}</span>
          </div>
          <span class="part-block__name">{{ member.name }}</span>
        </div>
      </div>

      <ul class="part-block__stats" aria-label="파트 포인트 상세">
        <li
          v-for="(row, index) in pointBreakdown"
          :key="row.label"
          class="part-block__stat"
          :class="`part-block__stat--${row.tier}`"
          :style="{
            ...(row.tier === 'strong' ? { '--stat-accent': getRgbColor(row.stat.type) } : {}),
            ...(landing ? { '--reveal-delay': `${0.05 + index * 0.07}s` } : {}),
          }"
        >
          <span class="part-block__stat-label">{{ row.label }}</span>
          <RGBTypeDot :type="row.stat.type" :size="12" />
          <span class="part-block__stat-level">{{ row.stat.level }}</span>
          <span class="part-block__stat-point">{{ formatPoint(row.point) }}</span>
        </li>
      </ul>

      <div class="part-block__total">
        <span class="part-block__total-label">포인트</span>
        <div class="part-block__total-row">
          <span
            class="part-block__total-value"
            :class="{
              'part-block__total-value--pop': totalPop,
              'part-block__total-value--penalty': hasOverloadPenalty,
            }"
          >
            {{ formatPoint(totalPoint) }}
          </span>
          <span v-if="hasOverloadPenalty" class="part-block__penalty-badge">반감</span>
        </div>
      </div>
    </div>

    <div v-else class="part-block__empty">
      <span class="part-block__empty-icon" aria-hidden="true">+</span>
      <span class="part-block__empty-text">드롭</span>
    </div>

    <span
      v-if="pointPop !== null"
      class="part-block__point-pop"
      :class="{ 'part-block__point-pop--great': landingGreat }"
      aria-hidden="true"
    >
      +{{ formatPoint(pointPop) }}
    </span>

    <span
      v-if="bonusPop !== null"
      class="part-block__bonus-pop"
      :class="{
        'part-block__bonus-pop--up': bonusPop > 0,
        'part-block__bonus-pop--down': bonusPop < 0,
      }"
      aria-hidden="true"
    >
      {{ bonusPop > 0 ? '+' : '' }}{{ Math.round(bonusPop * 100) }}% 고유
    </span>

    <button
      type="button"
      class="part-block__reroll"
      :class="{ 'part-block__reroll--disabled': !canReroll }"
      :disabled="!canReroll"
      :aria-label="isChorusReroll ? `싸비 상성 일괄 리롤, ${rerollCost} 코인` : `상성 리롤, ${rerollCost} 코인`"
      @click.stop="onReroll"
    >
      <span class="part-block__reroll-label">{{ isChorusReroll ? '싸비 리롤' : '리롤' }}</span>
      <span class="part-block__reroll-cost">-{{ rerollCost }} 코인</span>
    </button>
  </div>
</template>

<style scoped>
.part-block {
  position: relative;
  flex-shrink: 0;
  width: 132px;
  min-height: 248px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  scroll-snap-align: start;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
}

.part-block--drop-target {
  border-color: var(--color-b);
  background: color-mix(in srgb, var(--color-b) 10%, var(--color-surface));
}

.part-block--return-target {
  border-color: var(--color-text-muted);
  background: color-mix(in srgb, var(--color-text-muted) 10%, var(--color-surface));
}

.part-block--match-good {
  --juice-color: var(--color-b);
  border-color: var(--color-b);
  background: color-mix(in srgb, var(--color-b) 16%, var(--color-surface));
  animation: glow-pulse 0.9s ease-in-out infinite;
}

.part-block--match-great {
  --juice-color: var(--color-g);
  border-color: var(--color-g);
  background: color-mix(in srgb, var(--color-g) 18%, var(--color-surface));
  animation: glow-pulse 0.7s ease-in-out infinite;
}

.part-block--landing {
  animation: pop-land 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.part-block--landing-great {
  --juice-color: var(--color-g);
  box-shadow: 0 0 20px 4px color-mix(in srgb, var(--color-g) 35%, transparent);
}

.part-block--filled {
  border-style: solid;
}

.part-block__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.part-block__duration {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.75;
}

.part-block__bonus {
  font-size: 9px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
  transition: color 0.15s, transform 0.15s;
}

.part-block__bonus--high {
  color: var(--color-g);
}

.part-block__bonus--low {
  color: #e8a04c;
}

.part-block__bonus--flash {
  animation: bonus-reroll 0.52s cubic-bezier(0.34, 1.3, 0.64, 1);
}

@keyframes bonus-reroll {
  0% { transform: scale(1); opacity: 1; }
  35% { transform: scale(1.12); opacity: 0.55; }
  100% { transform: scale(1); opacity: 1; }
}

.part-block__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.part-block__member {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  width: 100%;
  margin: 0 -2px;
  padding: 4px 6px 4px 2px;
  border: 1px dashed color-mix(in srgb, var(--color-b) 45%, var(--color-border));
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-b) 7%, var(--color-bg));
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: border-color 0.15s, background-color 0.15s, opacity 0.15s;
}

.part-block__member:active {
  cursor: grabbing;
  border-color: var(--color-b);
  background: color-mix(in srgb, var(--color-b) 14%, var(--color-bg));
}

.part-block__member--dragging {
  opacity: 0.45;
}

.part-block__handle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-shrink: 0;
  width: 22px;
  padding: 2px 4px 2px 2px;
  margin-right: 4px;
  border-right: 1px dashed color-mix(in srgb, var(--color-b) 35%, var(--color-border));
}

.part-block__grip {
  width: 10px;
  height: 16px;
  fill: var(--color-text-muted);
  transform: rotate(90deg);
}

.part-block__member-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 0;
}

.part-block__member:active .part-block__grip {
  fill: var(--color-b);
}

.part-block__handle-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  color: var(--color-text-muted);
  writing-mode: vertical-rl;
}

.part-block__member:active .part-block__handle-label {
  color: var(--color-b);
}

.part-block__body--reveal .part-block__stat {
  animation: stat-reveal 0.38s cubic-bezier(0.34, 1.3, 0.64, 1) backwards;
  animation-delay: var(--reveal-delay, 0s);
}

.part-block__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-muted);
}

.part-block__empty-icon {
  font-size: 22px;
  line-height: 1;
  opacity: 0.5;
}

.part-block__empty-text {
  font-size: 11px;
  opacity: 0.7;
}

.part-block__face {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg);
}

.part-block__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.part-block__initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
}

.part-block__name {
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.part-block__stats {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 4px;
}

.part-block__stat {
  display: grid;
  grid-template-columns: 24px 12px 16px 1fr;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  border-radius: 3px;
  margin: 0 -2px;
  padding: 1px 2px;
}

.part-block__stat--strong {
  background: color-mix(in srgb, var(--stat-accent) 22%, transparent);
}

.part-block__body--reveal .part-block__stat--strong {
  animation: stat-reveal 0.38s cubic-bezier(0.34, 1.3, 0.64, 1) backwards,
    affinity-shimmer 0.8s ease-in-out 0.2s 2;
  animation-delay: var(--reveal-delay, 0s), calc(var(--reveal-delay, 0s) + 0.2s);
}

.part-block__stat--strong .part-block__stat-label,
.part-block__stat--strong .part-block__stat-level,
.part-block__stat--strong .part-block__stat-point {
  font-weight: 700;
}

.part-block__stat--weak {
  opacity: 0.4;
}

.part-block__stat-label {
  color: var(--color-text-muted);
}

.part-block__stat-level {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.part-block__stat-point {
  justify-self: end;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.part-block__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
}

.part-block__total-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.part-block__total-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.part-block__total-value {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.part-block__total-value--pop {
  animation: total-pop 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.part-block__total-value--penalty {
  color: #e8a04c;
}

.part-block__penalty-badge {
  padding: 1px 5px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #e8a04c;
  background: color-mix(in srgb, #e8a04c 16%, transparent);
  border: 1px solid color-mix(in srgb, #e8a04c 40%, var(--color-border));
  border-radius: 999px;
}

.part-block__point-pop {
  position: absolute;
  left: 50%;
  top: 42%;
  z-index: 2;
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--color-b);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  animation: point-float-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.part-block__point-pop--great {
  font-size: 20px;
  color: var(--color-g);
  text-shadow: 0 0 12px color-mix(in srgb, var(--color-g) 60%, transparent);
}

.part-block__bonus-pop {
  position: absolute;
  left: 50%;
  top: 28%;
  z-index: 2;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  animation: point-float-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.part-block__bonus-pop--up {
  color: var(--color-g);
  text-shadow: 0 0 10px color-mix(in srgb, var(--color-g) 50%, transparent);
}

.part-block__bonus-pop--down {
  color: #e8a04c;
  text-shadow: 0 0 10px color-mix(in srgb, #e8a04c 50%, transparent);
}

.part-block__reroll {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  margin-top: auto;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-b) 10%, var(--color-bg));
  border: 1px solid color-mix(in srgb, var(--color-b) 35%, var(--color-border));
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s, transform 0.15s;
}

.part-block__reroll:active:not(:disabled) {
  transform: scale(0.96);
  background: color-mix(in srgb, var(--color-b) 18%, var(--color-bg));
  border-color: var(--color-b);
}

.part-block__reroll--disabled,
.part-block__reroll:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.part-block__reroll-label {
  letter-spacing: 0.04em;
}

.part-block__reroll-cost {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-b);
  background: color-mix(in srgb, var(--color-b) 14%, transparent);
  border-radius: 999px;
}
</style>
