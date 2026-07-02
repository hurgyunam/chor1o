<script setup lang="ts">
import type { DemoPartBlock } from '@/types/demo'
import type { PartBlock } from '@/types'
import PartAffinitySpec from '@/components/PartAffinitySpec.vue'
import { formatPartBonus } from '@/utils/partBonus'

const props = defineProps<{
  part: DemoPartBlock
}>()

const affinityPart = {
  name: 'intro',
  label: props.part.label,
  duration: props.part.duration,
  bonusMultiplier: props.part.bonusMultiplier,
  strongType: props.part.strongType,
  neutralType: props.part.neutralType,
  weakType: props.part.weakType,
  assignedMemberId: null,
} satisfies PartBlock
</script>

<template>
  <div class="demo-part-block">
    <span class="demo-part-block__label">
      {{ part.label }}
      <span class="demo-part-block__duration">{{ part.duration }}초</span>
      <span
        class="demo-part-block__bonus"
        :class="{
          'demo-part-block__bonus--high': part.bonusMultiplier > 1,
          'demo-part-block__bonus--low': part.bonusMultiplier < 1,
        }"
      >
        고유 {{ formatPartBonus(part.bonusMultiplier) }}
      </span>
    </span>
    <PartAffinitySpec :part="affinityPart" />
  </div>
</template>

<style scoped>
.demo-part-block {
  flex-shrink: 0;
  width: 132px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  scroll-snap-align: start;
}

.demo-part-block__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
}

.demo-part-block__duration {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.75;
}

.demo-part-block__bonus {
  font-size: 9px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.demo-part-block__bonus--high {
  color: var(--color-g);
}

.demo-part-block__bonus--low {
  color: #e8a04c;
}
</style>
