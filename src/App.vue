<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MemberCard from '@/components/MemberCard.vue'
import { useMemberStore } from '@/stores/useMemberStore'

const memberStore = useMemberStore()
const { members } = storeToRefs(memberStore)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <span class="app-title">chor1o</span>
    </header>
    <main class="app-main">
      <section class="preview-section">
        <h1 class="preview-title">멤버 카드</h1>
        <div class="member-card-list">
          <MemberCard
            v-for="member in members"
            :key="member.id"
            :member="member"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
}

.app-main {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.preview-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.member-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
