<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DemoPartBlockList from '@/components/DemoPartBlockList.vue'
import DemoSongHeader from '@/components/DemoSongHeader.vue'
import { useDemoStore } from '@/stores/useDemoStore'

const route = useRoute()
const router = useRouter()
const demoStore = useDemoStore()

const demo = computed(() => demoStore.getDemoById(String(route.params.id)))

function goBack() {
  router.push({ name: 'demos' })
}
</script>

<template>
  <div v-if="demo" class="app-shell">
    <DemoSongHeader :demo="demo" />

    <main class="game-area">
      <DemoPartBlockList :parts="demo.parts" />
    </main>
  </div>

  <div v-else class="demo-song-missing">
    <p class="demo-song-missing__text">데모를 찾을 수 없습니다.</p>
    <button type="button" class="demo-song-missing__back" @click="goBack">데모 목록으로</button>
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

.demo-song-missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  padding: 24px;
}

.demo-song-missing__text {
  font-size: 14px;
  color: var(--color-text-muted);
}

.demo-song-missing__back {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--color-b);
  border: 1px solid var(--color-b);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
</style>
