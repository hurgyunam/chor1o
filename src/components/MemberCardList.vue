<script setup lang="ts">
import type { Member } from '@/types'
import MemberCard from '@/components/MemberCard.vue'

defineProps<{
  members: Member[]
}>()
</script>

<template>
  <div class="member-card-list" role="list" aria-label="멤버 카드 목록">
    <MemberCard
      v-for="member in members"
      :key="member.id"
      role="listitem"
      :member="member"
      draggable
    />
  </div>
</template>

<style scoped>
.member-card-list {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  padding: 12px 16px;
}

.member-card-list::-webkit-scrollbar {
  display: none;
}

.member-card-list :deep(.member-card) {
  flex-shrink: 0;
  scroll-snap-align: start;
}
</style>
