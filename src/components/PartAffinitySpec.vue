<script setup lang="ts">
import { computed } from 'vue'
import type { PartBlock } from '@/types'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { getPartAffinities } from '@/utils/pointCalc'

const props = defineProps<{
  part: PartBlock
  flash?: boolean
}>()

const affinities = computed(() => getPartAffinities(props.part))
</script>

<template>
  <ul
    class="part-affinity"
    :class="{ 'part-affinity--flash': flash }"
    aria-label="파트 RGB 상성"
  >
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

.part-affinity--flash {
  animation: affinity-reroll 0.52s cubic-bezier(0.34, 1.3, 0.64, 1);
}

@keyframes affinity-reroll {
  0% { transform: scale(1); opacity: 1; }
  35% { transform: scale(1.08); opacity: 0.55; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
