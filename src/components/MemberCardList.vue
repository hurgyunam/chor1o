<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Member } from '@/types'
import MemberAvatarChip from '@/components/MemberAvatarChip.vue'
import MemberDetailSheet from '@/components/MemberDetailSheet.vue'
import { useDragStore } from '@/stores/useDragStore'

const props = defineProps<{
  members: Member[]
}>()

const dragStore = useDragStore()
const { isDragging } = storeToRefs(dragStore)

const detailMemberId = ref<string | null>(null)

const detailMember = computed(
  () => props.members.find((m) => m.id === detailMemberId.value) ?? null,
)

function onChipTap(memberId: string) {
  detailMemberId.value = detailMemberId.value === memberId ? null : memberId
}

function closeDetail() {
  detailMemberId.value = null
}

watch(isDragging, (dragging) => {
  if (dragging) detailMemberId.value = null
})

watch(
  () => props.members,
  (members) => {
    if (detailMemberId.value && !members.some((m) => m.id === detailMemberId.value)) {
      detailMemberId.value = null
    }
  },
)
</script>

<template>
  <div class="member-strip" role="list" aria-label="멤버 목록">
    <MemberAvatarChip
      v-for="member in members"
      :key="member.id"
      role="listitem"
      :member="member"
      :selected="detailMemberId === member.id"
      draggable
      @tap="onChipTap(member.id)"
    />
  </div>

  <MemberDetailSheet
    v-if="detailMember"
    :member="detailMember"
    @close="closeDetail"
  />
</template>

<style scoped>
.member-strip {
  display: flex;
  flex-direction: row;
  justify-content: safe center;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  padding: 8px 12px 10px;
}

.member-strip::-webkit-scrollbar {
  display: none;
}
</style>
