<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import MemberCard from '@/components/MemberCard.vue'
import { useDragStore } from '@/stores/useDragStore'
import { useMemberStore } from '@/stores/useMemberStore'

const dragStore = useDragStore()
const memberStore = useMemberStore()
const { isDragging, source, pointerX, pointerY } = storeToRefs(dragStore)

const draggedMember = computed(() => {
  if (!source.value) return null
  return memberStore.getMemberById(source.value.memberId) ?? null
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
      <div class="drag-overlay__ghost" :style="ghostStyle">
        <MemberCard :member="draggedMember" class="drag-overlay__card" />
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
  opacity: 0.85;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45));
  scale: 0.92;
}

.drag-overlay__card {
  pointer-events: none;
}
</style>
