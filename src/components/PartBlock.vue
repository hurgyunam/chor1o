<script setup lang="ts">
import { computed } from 'vue'
import type { Member, PartBlock as PartBlockType } from '@/types'
import PartAffinitySpec from '@/components/PartAffinitySpec.vue'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { useDragStore } from '@/stores/useDragStore'
import { useSongStore } from '@/stores/useSongStore'
import { useDraggable } from '@/composables/useDraggable'
import { calcPartPoint, calcPartPointBreakdown, formatPoint } from '@/utils/pointCalc'

const props = defineProps<{
  part: PartBlockType
  member: Member | null
}>()

const dragStore = useDragStore()
const songStore = useSongStore()

const isDropTarget = computed(
  () => dragStore.isDragging && dragStore.source?.kind === 'member-list',
)

const pointBreakdown = computed(() =>
  props.member ? calcPartPointBreakdown(props.member, props.part) : [],
)

const totalPoint = computed(() =>
  props.member ? calcPartPoint(props.member, props.part) : 0,
)

const assignedDraggable = useDraggable({
  getSource: () => ({
    kind: 'part-block',
    partName: props.part.name,
    memberId: props.member!.id,
  }),
  disabled: computed(() => !props.member),
})

function onDrop() {
  const src = dragStore.source
  if (!src) return
  if (src.kind === 'part-block' && src.partName !== props.part.name) {
    songStore.unassignMember(src.partName)
  }
  if (src.kind === 'member-list' || src.kind === 'part-block') {
    songStore.assignMember(props.part.name, src.memberId)
  }
}
</script>

<template>
  <div
    class="part-block"
    :class="{
      'part-block--drop-target': isDropTarget,
      'part-block--filled': !!member,
    }"
    data-drop-zone="part"
    :data-part-name="part.name"
    @chor1o-drop="onDrop"
  >
    <span class="part-block__label">{{ part.label }}</span>
    <PartAffinitySpec :part="part" />

    <div v-if="member" class="part-block__body" @pointerdown="assignedDraggable.onPointerDown">
      <div class="part-block__member">
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

      <ul class="part-block__stats" aria-label="파트 포인트 상세">
        <li
          v-for="row in pointBreakdown"
          :key="row.label"
          class="part-block__stat"
        >
          <span class="part-block__stat-label">{{ row.label }}</span>
          <RGBTypeDot :type="row.stat.type" :size="12" />
          <span class="part-block__stat-level">{{ row.stat.level }}</span>
          <span class="part-block__stat-point">{{ formatPoint(row.point) }}</span>
        </li>
      </ul>

      <div class="part-block__total">
        <span class="part-block__total-label">포인트</span>
        <span class="part-block__total-value">{{ formatPoint(totalPoint) }}</span>
      </div>
    </div>

    <div v-else class="part-block__empty">
      <span class="part-block__empty-icon" aria-hidden="true">+</span>
      <span class="part-block__empty-text">드롭</span>
    </div>
  </div>
</template>

<style scoped>
.part-block {
  flex-shrink: 0;
  width: 132px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  scroll-snap-align: start;
  transition: border-color 0.15s, background-color 0.15s;
}

.part-block--drop-target {
  border-color: var(--color-b);
  background: color-mix(in srgb, var(--color-b) 8%, var(--color-surface));
}

.part-block--filled {
  border-style: solid;
}

.part-block__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.part-block__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: grab;
  touch-action: none;
}

.part-block__body:active {
  cursor: grabbing;
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

.part-block__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.part-block__face {
  width: 48px;
  height: 48px;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
}

.part-block__name {
  font-size: 11px;
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
  border-top: 1px solid var(--color-border);
}

.part-block__stat {
  display: grid;
  grid-template-columns: 24px 12px 16px 1fr;
  align-items: center;
  gap: 4px;
  font-size: 10px;
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
</style>
