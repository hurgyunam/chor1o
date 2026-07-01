<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { Member } from '@/types'
import MemberCard from '@/components/MemberCard.vue'

defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="member-sheet" @click.self="emit('close')">
      <div
        class="member-sheet__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="`${member.name} 상세 정보`"
      >
        <div class="member-sheet__handle" aria-hidden="true" />

        <header class="member-sheet__header">
          <h2 class="member-sheet__title">{{ member.name }}</h2>
          <button
            type="button"
            class="member-sheet__close"
            aria-label="닫기"
            @click="emit('close')"
          >
            닫기
          </button>
        </header>

        <div class="member-sheet__body">
          <MemberCard :member="member" draggable />
          <p class="member-sheet__hint">길게 눌러 파트에 배치할 수 있습니다</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.member-sheet {
  position: fixed;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  animation: sheet-fade-in 0.2s ease;
}

.member-sheet__panel {
  width: 100%;
  max-width: 430px;
  max-height: min(72vh, 520px);
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  animation: sheet-slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.member-sheet__handle {
  flex-shrink: 0;
  width: 36px;
  height: 4px;
  margin: 10px auto 0;
  border-radius: 999px;
  background: var(--color-border);
}

.member-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 8px;
}

.member-sheet__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.member-sheet__close {
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.member-sheet__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 20px;
  -webkit-overflow-scrolling: touch;
}

.member-sheet__body :deep(.member-card) {
  min-width: 0;
  width: 100%;
}

.member-sheet__hint {
  margin-top: 10px;
  font-size: 11px;
  text-align: center;
  color: var(--color-text-muted);
}

@keyframes sheet-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes sheet-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
