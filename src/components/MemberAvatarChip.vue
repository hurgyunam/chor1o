<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Member } from '@/types'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { useDragStore } from '@/stores/useDragStore'
import { useSongStore } from '@/stores/useSongStore'
import { useDraggable } from '@/composables/useDraggable'
import { useChipTap } from '@/composables/useChipTap'
import {
  formatSharePercent,
  getMemberShare,
  MEMBER_SHARE_PENALTY_THRESHOLD,
} from '@/utils/pointCalc'

const props = defineProps<{
  member: Member
  selected?: boolean
  draggable?: boolean
}>()

const emit = defineEmits<{
  tap: []
}>()

const dragStore = useDragStore()
const songStore = useSongStore()
const { parts } = storeToRefs(songStore)

const isDisabled = computed(() => props.draggable === false)

const isBeingDragged = computed(
  () => dragStore.isDragging && dragStore.source?.memberId === props.member.id,
)

const partShare = computed(() => getMemberShare(props.member.id, parts.value))

const isSharePenalized = computed(() => partShare.value > MEMBER_SHARE_PENALTY_THRESHOLD)

const statTypes = computed(() => [
  props.member.appearance.type,
  props.member.vocal.type,
  props.member.choreography.type,
])

let lastTapAt = 0

function emitTap() {
  const now = Date.now()
  if (now - lastTapAt < 400) return
  lastTapAt = now
  emit('tap')
}

const chipTap = useChipTap({
  disabled: isDisabled,
  onTap: emitTap,
})

const draggable = useDraggable({
  getSource: () => ({ kind: 'member-list', memberId: props.member.id }),
  disabled: isDisabled,
  requireLongPress: true,
  onTap: emitTap,
})
</script>

<template>
  <button
    type="button"
    class="member-chip"
    :class="{
      'member-chip--selected': selected,
      'member-chip--dragging': isBeingDragged,
      'member-chip--penalty': isSharePenalized,
    }"
    :aria-label="`${member.name} 멤버, 파트 비중 ${formatSharePercent(partShare)}, 탭하여 상세 보기, 길게 눌러 드래그`"
    :aria-pressed="selected"
    @pointerdown="draggable.onPointerDown"
    @click="draggable.onClick"
    @touchstart.passive="chipTap.onTouchStart"
    @touchmove.passive="chipTap.onTouchMove"
    @touchend="chipTap.onTouchEnd"
    @touchcancel.passive="chipTap.onTouchCancel"
  >
    <div class="member-chip__avatar">
      <img
        v-if="member.imageUrl"
        :src="member.imageUrl"
        :alt="`${member.name} 프로필`"
        class="member-chip__image"
      />
      <span v-else class="member-chip__placeholder" aria-hidden="true">
        {{ member.name.charAt(0) }}
      </span>
      <span
        v-if="partShare > 0"
        class="member-chip__share"
        :class="{ 'member-chip__share--penalty': isSharePenalized }"
        aria-hidden="true"
      >
        {{ formatSharePercent(partShare) }}
      </span>
    </div>

    <span class="member-chip__name">{{ member.name }}</span>

    <div class="member-chip__dots" aria-hidden="true">
      <RGBTypeDot v-for="(type, i) in statTypes" :key="i" :type="type" :size="7" />
    </div>
  </button>
</template>

<style scoped>
.member-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  width: 58px;
  padding: 4px 2px 2px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  scroll-snap-align: center;
  transition: background 0.15s, transform 0.15s;
}

.member-chip--selected {
  background: color-mix(in srgb, var(--color-b) 14%, transparent);
}

.member-chip:active:not(.member-chip--dragging) {
  transform: scale(0.94);
}

.member-chip--dragging {
  opacity: 0.35;
}

.member-chip--penalty .member-chip__avatar {
  box-shadow: 0 0 0 2px color-mix(in srgb, #e8a04c 70%, transparent);
}

.member-chip__avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  transition: border-color 0.15s;
}

.member-chip--selected .member-chip__avatar {
  border-color: var(--color-b);
}

.member-chip__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-chip__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
}

.member-chip__share {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 2px 3px;
  font-size: 9px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #fff;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.82) 0%,
    rgba(0, 0, 0, 0.5) 55%,
    transparent 100%
  );
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.member-chip__share--penalty {
  color: #ffe4b8;
  background: linear-gradient(
    to top,
    color-mix(in srgb, #e8a04c 92%, #000) 0%,
    color-mix(in srgb, #e8a04c 55%, transparent) 55%,
    transparent 100%
  );
}

.member-chip__name {
  max-width: 100%;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-chip__dots {
  display: flex;
  gap: 3px;
  align-items: center;
}
</style>
