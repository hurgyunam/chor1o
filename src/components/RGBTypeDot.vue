<script setup lang="ts">
import { computed } from 'vue'
import type { RGBType } from '@/types'
import { getRgbColor } from '@/utils/rgb'

const props = withDefaults(
  defineProps<{
    type: RGBType
    size?: number
  }>(),
  { size: 14 },
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  backgroundColor: getRgbColor(props.type),
}))
</script>

<template>
  <span
    class="rgb-type-dot"
    :style="style"
    :title="type"
    role="img"
    :aria-label="`${type} 타입`"
  />
</template>

<style scoped>
.rgb-type-dot {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
