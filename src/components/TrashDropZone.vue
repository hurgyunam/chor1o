<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDragStore } from '@/stores/useDragStore'
import { useSongStore } from '@/stores/useSongStore'

const dragStore = useDragStore()
const songStore = useSongStore()
const { isDragging } = storeToRefs(dragStore)

const isActive = computed(() => isDragging.value && dragStore.source?.kind === 'part-block')

function onDrop() {
  const src = dragStore.source
  if (src?.kind === 'part-block') {
    songStore.unassignMember(src.partName)
  }
}
</script>

<template>
  <Transition name="trash">
    <div
      v-if="isDragging"
      class="trash-drop-zone"
      :class="{ 'trash-drop-zone--active': isActive }"
      data-drop-zone="trash"
      aria-label="멤버 카드 삭제"
      @chor1o-drop="onDrop"
    >
      <svg class="trash-drop-zone__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1.07l-1.04 12.04A2 2 0 0 1 15.9 22H8.1a2 2 0 0 1-1.99-1.96L5.07 7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm1 2h4V5h-4V5zm-2.1 2 1 12h8.2l1-12H7.9z"
        />
      </svg>
      <span class="trash-drop-zone__label">삭제</span>
    </div>
  </Transition>
</template>

<style scoped>
.trash-drop-zone {
  position: fixed;
  top: 92px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 72px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  color: var(--color-text-muted);
  pointer-events: auto;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}

.trash-drop-zone--active {
  border-color: #ff4d6d;
  color: #ff4d6d;
  background: color-mix(in srgb, #ff4d6d 12%, var(--color-surface));
}

.trash-drop-zone__icon {
  width: 28px;
  height: 28px;
}

.trash-drop-zone__label {
  font-size: 11px;
  font-weight: 600;
}

.trash-enter-active,
.trash-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.trash-enter-from,
.trash-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
