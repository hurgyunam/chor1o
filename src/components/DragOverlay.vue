<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import MemberCard from '@/components/MemberCard.vue'
import { useDragStore } from '@/stores/useDragStore'
import { useMemberStore } from '@/stores/useMemberStore'
import { useSongStore } from '@/stores/useSongStore'
import { getMatchQuality } from '@/utils/pointCalc'

const dragStore = useDragStore()
const memberStore = useMemberStore()
const songStore = useSongStore()
const { isDragging, source, pointerX, pointerY, hoveredPartName } = storeToRefs(dragStore)

const draggedMember = computed(() => {
  if (!source.value) return null
  return memberStore.getMemberById(source.value.memberId) ?? null
})

const hoveredPart = computed(() => {
  if (!hoveredPartName.value) return null
  return songStore.parts.find((part) => part.name === hoveredPartName.value) ?? null
})

const matchQuality = computed(() => {
  if (!draggedMember.value || !hoveredPart.value) return null
  return getMatchQuality(draggedMember.value, hoveredPart.value)
})

const ghostStyle = computed(() => ({
  left: `${pointerX.value}px`,
  top: `${pointerY.value}px`,
}))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isDragging && draggedMember"
      class="drag-overlay"
      aria-hidden="true"
    >
      <div
        class="drag-overlay__ghost"
        :class="{
          'drag-overlay__ghost--over-part': hoveredPart,
          [`drag-overlay__ghost--match-${matchQuality}`]: matchQuality,
        }"
        :style="ghostStyle"
      >
        <MemberCard
          :member="draggedMember"
          :part="hoveredPart ?? undefined"
          class="drag-overlay__card"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.drag-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}

.drag-overlay__ghost {
  position: fixed;
  transform: translate(-50%, -50%);
  opacity: 0.88;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45));
  scale: 0.92;
  transition: scale 0.18s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.15s, filter 0.18s;
}

.drag-overlay__ghost--over-part {
  scale: 1;
  opacity: 0.95;
  animation: ghost-snap 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.drag-overlay__ghost--match-good {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45))
    drop-shadow(0 0 10px color-mix(in srgb, var(--color-b) 50%, transparent));
}

.drag-overlay__ghost--match-great {
  scale: 1.04;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45))
    drop-shadow(0 0 14px color-mix(in srgb, var(--color-g) 60%, transparent));
}

.drag-overlay__card {
  pointer-events: none;
}
</style>
