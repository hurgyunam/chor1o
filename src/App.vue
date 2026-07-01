<script setup lang="ts">
import { storeToRefs } from 'pinia'
import DragOverlay from '@/components/DragOverlay.vue'
import MemberCardList from '@/components/MemberCardList.vue'
import PartBlockList from '@/components/PartBlockList.vue'
import SongPointHeader from '@/components/SongPointHeader.vue'
import TrashDropZone from '@/components/TrashDropZone.vue'
import { useMemberStore } from '@/stores/useMemberStore'

const memberStore = useMemberStore()
const { members } = storeToRefs(memberStore)
</script>

<template>
  <div class="app-shell">
    <SongPointHeader />

    <main class="game-area">
      <TrashDropZone />
      <PartBlockList />
    </main>

    <footer class="member-dock">
      <MemberCardList :members="members" />
    </footer>

    <DragOverlay />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.game-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.member-dock {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}
</style>
