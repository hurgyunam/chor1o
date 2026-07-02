<script setup lang="ts">
import DemoPartBlock from '@/components/DemoPartBlock.vue'
import type { DemoPartBlock as DemoPartBlockType } from '@/types/demo'

defineProps<{
  parts: DemoPartBlockType[]
}>()
</script>

<template>
  <div class="demo-part-block-list" role="list" aria-label="데모 곡 파트 목록">
    <DemoPartBlock
      v-for="part in parts"
      :key="part.id"
      role="listitem"
      :part="part"
    />
  </div>
</template>

<style scoped>
.demo-part-block-list {
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

.demo-part-block-list::-webkit-scrollbar {
  display: none;
}
</style>
