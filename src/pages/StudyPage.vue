<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import ActionBar from '../components/ActionBar.vue'
import ChatPanel from '../components/ChatPanel.vue'
import ProgressRing from '../components/ProgressRing.vue'
import WordCard from '../components/WordCard.vue'
import { useWordSession } from '../composables/useWordSession'
import type { Word } from '../types/word'

const session = inject<ReturnType<typeof useWordSession>>('wordSession')
const appStatus = inject<{
  backendOk: Ref<boolean | null>
  backendText: ComputedRef<string>
  loadError: Ref<string>
}>('appStatus')

if (!session || !appStatus) {
  throw new Error('wordSession / appStatus 未注入')
}

const { currentWord, stats, busy, mark } = session
const { backendOk, backendText, loadError } = appStatus

const chatOpen = ref(false)
const chatWord = ref<Word | null>(null)
const todayCount = ref(0)
const todayGoal = ref(50)

async function loadToday() {
  try {
    const res = await fetch('/api/progress/today')
    if (res.ok) {
      const data = (await res.json()) as { count: number; goal: number }
      todayCount.value = data.count
      todayGoal.value = data.goal
    }
  } catch {
    // 静默
  }
}

async function onMark(state: 'known' | 'unknown') {
  await mark(state)
  todayCount.value += 1
}

function openChat() {
  if (!currentWord.value) return
  chatWord.value = currentWord.value
  chatOpen.value = true
}

onMounted(loadToday)
</script>

<template>
  <div class="study">
    <p
      class="backend"
      :class="backendOk === true ? 'ok' : backendOk === false ? 'fail' : ''"
    >
      {{ backendText }}
    </p>

    <div class="progress-row">
      <ProgressRing :current="todayCount" :goal="todayGoal" :size="90" />
      <div class="stats">
        <span class="due">待复习 {{ stats.dueNow }}</span>
        <span>未学 {{ stats.newCount }}</span>
        <span class="known">熟词 {{ stats.known }}</span>
        <span class="unknown">生词 {{ stats.unknown }}</span>
      </div>
    </div>

    <p v-if="loadError" class="load-error">{{ loadError }}</p>
    <template v-else>
      <WordCard v-if="currentWord" :word="currentWord" @ask="openChat" />
      <p v-else class="loading">正在加载…</p>
      <ActionBar :disabled="busy" @mark="onMark" />
    </template>

    <ChatPanel
      v-if="chatOpen && chatWord"
      :word="chatWord"
      @close="chatOpen = false"
    />
  </div>
</template>

<style scoped>
.study {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.backend {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.backend.ok { color: #166534; }
.backend.fail { color: #991b1b; }

.progress-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 13px;
  color: #6b7280;
}

.stats .due { color: #b45309; }
.stats .known { color: #166534; }
.stats .unknown { color: #991b1b; }

.loading,
.load-error {
  text-align: center;
  color: #6b7280;
}

.load-error { color: #991b1b; }

@media (min-width: 769px) {
  .study { padding-top: 0; }
}
</style>
