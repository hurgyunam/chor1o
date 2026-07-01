<script setup lang="ts">
import { computed } from 'vue'
import type { PartBlock } from '@/types'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { getPartAffinities } from '@/utils/pointCalc'

const props = defineProps<{
  part: PartBlock
}>()

const affinities = computed(() => getPartAffinities(props.part))
</script>

<template>
  <ul class="part-affinity" aria-label="파트 RGB 상성">
    <li
      v-for="affinity in affinities"
      :key="affinity.tier"
      class="part-affinity__item"
      :class="`part-affinity__item--${affinity.tier}`"
    >
      <RGBTypeDot :type="affinity.type" :size="12" />
      <span class="part-affinity__label">{{ affinity.label }}</span>
    </li>
  </ul>
</template>

<style scoped>
.part-affinity {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.part-affinity__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.part-affinity__label {
  font-size: 9px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.part-affinity__item--strong .part-affinity__label {
  color: var(--color-text);
}
</style>
