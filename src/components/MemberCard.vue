<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Member, PartBlock } from '@/types'
import RGBTypeDot from '@/components/RGBTypeDot.vue'
import { useDragStore } from '@/stores/useDragStore'
import { useSongStore } from '@/stores/useSongStore'
import { useDraggable } from '@/composables/useDraggable'
import {
  formatSharePercent,
  getMemberShare,
  getStatAffinityTier,
  MEMBER_SHARE_PENALTY_THRESHOLD,
} from '@/utils/pointCalc'
import { getRgbColor } from '@/utils/rgb'

const props = defineProps<{
  member: Member
  draggable?: boolean
  part?: PartBlock
}>()

const dragStore = useDragStore()
const songStore = useSongStore()
const { parts } = storeToRefs(songStore)

const isBeingDragged = computed(
  () => dragStore.isDragging && dragStore.source?.memberId === props.member.id,
)

const partShare = computed(() => getMemberShare(props.member.id, parts.value))

const isSharePenalized = computed(() => partShare.value > MEMBER_SHARE_PENALTY_THRESHOLD)

const draggable = useDraggable({
  getSource: () => ({ kind: 'member-list', memberId: props.member.id }),
  disabled: computed(() => !props.draggable),
  requireLongPress: true,
})

const statRows = computed(() => [
  { label: '외모', stat: props.member.appearance },
  { label: '보컬', stat: props.member.vocal },
  { label: '안무', stat: props.member.choreography },
].map((row) => ({
  ...row,
  affinityTier: props.part ? getStatAffinityTier(row.stat.type, props.part) : null,
  accentColor: getRgbColor(row.stat.type),
})))
</script>

<template>
  <article
    class="member-card"
    :class="{ 'member-card--dragging': isBeingDragged }"
    @pointerdown="draggable.onPointerDown"
  >
    <div class="member-card__face">
      <img
        v-if="member.imageUrl"
        :src="member.imageUrl"
        :alt="`${member.name} 프로필`"
        class="member-card__image"
      />
      <div v-else class="member-card__placeholder" aria-hidden="true">
        {{ member.name.charAt(0) }}
      </div>
    </div>

    <div class="member-card__info">
      <h2 class="member-card__name">{{ member.name }}</h2>

      <ul class="member-card__stats">
        <li
          v-for="row in statRows"
          :key="row.label"
          class="member-card__stat"
          :class="row.affinityTier ? `member-card__stat--${row.affinityTier}` : undefined"
          :style="row.affinityTier === 'strong' ? { '--stat-accent': row.accentColor } : undefined"
        >
          <span class="member-card__stat-label">{{ row.label }}</span>
          <RGBTypeDot :type="row.stat.type" :size="16" />
          <span class="member-card__stat-level">{{ row.stat.level }}</span>
        </li>
      </ul>

      <div
        class="member-card__share"
        :class="{ 'member-card__share--penalty': isSharePenalized }"
        :aria-label="`현재 곡 파트 비중 ${formatSharePercent(partShare)}`"
      >
        <span class="member-card__share-label">파트 비중</span>
        <span class="member-card__share-value">{{ formatSharePercent(partShare) }}</span>
        <span v-if="isSharePenalized" class="member-card__share-badge">반감</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.member-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 260px;
  touch-action: pan-x;
  user-select: none;
}

.member-card--dragging {
  opacity: 0.35;
}

.member-card__face {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg);
}

.member-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
}

.member-card__info {
  flex: 1;
  min-width: 0;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-card__name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
}

.member-card__share {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding: 4px 6px;
  margin-left: -4px;
  margin-right: -4px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-b) 8%, transparent);
}

.member-card__share--penalty {
  background: color-mix(in srgb, #e8a04c 14%, transparent);
}

.member-card__share-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.member-card__share-value {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.member-card__share--penalty .member-card__share-value {
  color: #e8a04c;
}

.member-card__share-badge {
  margin-left: auto;
  padding: 1px 5px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #e8a04c;
  background: color-mix(in srgb, #e8a04c 16%, transparent);
  border: 1px solid color-mix(in srgb, #e8a04c 40%, var(--color-border));
  border-radius: 999px;
}

.member-card__stats {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-card__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  border-radius: 4px;
  margin: 0 -4px;
  padding: 2px 4px;
}

.member-card__stat--strong {
  background: color-mix(in srgb, var(--stat-accent) 22%, transparent);
  animation: affinity-shimmer 1.1s ease-in-out infinite;
}

.member-card__stat--strong .member-card__stat-label,
.member-card__stat--strong .member-card__stat-level {
  color: var(--color-text);
  font-weight: 700;
}

.member-card__stat--weak {
  opacity: 0.4;
}

.member-card__stat-label {
  width: 32px;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.member-card__stat-level {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}
</style>
