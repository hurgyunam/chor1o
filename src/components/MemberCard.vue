<script setup lang="ts">
import { computed } from 'vue'
import type { Member } from '@/types'
import RGBTypeDot from '@/components/RGBTypeDot.vue'

const props = defineProps<{
  member: Member
}>()

const statRows = computed(() => [
  { label: '외모', stat: props.member.appearance },
  { label: '보컬', stat: props.member.vocal },
  { label: '안무', stat: props.member.choreography },
])
</script>

<template>
  <article class="member-card">
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
        >
          <span class="member-card__stat-label">{{ row.label }}</span>
          <RGBTypeDot :type="row.stat.type" :size="16" />
          <span class="member-card__stat-level">{{ row.stat.level }}</span>
        </li>
      </ul>
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.member-card__name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
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
