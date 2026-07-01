<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PartBlock from '@/components/PartBlock.vue'
import { useMemberStore } from '@/stores/useMemberStore'
import { useSongStore } from '@/stores/useSongStore'

const memberStore = useMemberStore()
const songStore = useSongStore()
const { parts } = storeToRefs(songStore)

const memberMap = computed(() => new Map(memberStore.members.map((m) => [m.id, m])))

function getAssignedMember(memberId: string | null) {
  if (!memberId) return null
  return memberMap.value.get(memberId) ?? null
}
</script>

<template>
  <div class="part-block-list" role="list" aria-label="파트 블록 목록">
    <PartBlock
      v-for="part in parts"
      :key="part.name"
      role="listitem"
      :part="part"
      :member="getAssignedMember(part.assignedMemberId)"
    />
  </div>
</template>

<style scoped>
.part-block-list {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  padding: 16px;
  height: 100%;
  align-items: stretch;
}

.part-block-list::-webkit-scrollbar {
  display: none;
}
</style>
