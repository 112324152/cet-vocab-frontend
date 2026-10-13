<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionBar from './components/ActionBar.vue'
import WordCard from './components/WordCard.vue'
import { useWordSession } from './composables/useWordSession'
import type { Word } from './types/word'

const { currentWord, stats, init, mark } = useWordSession()

const backendOk = ref<boolean | null>(null)
const loadError = ref('')

const backendText = computed(() => {
  if (backendOk.value === null) return '正在检查后端…'
  return backendOk.value ? '后端已连接' : '后端未连接'
})

onMounted(async () => {
  try {
    const health = await fetch('/api/health')
    backendOk.value = health.ok
  } catch {
    backendOk.value = false
  }

  try {
    const res = await fetch('/api/words')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const words = (await res.json()) as Word[]
    init(words)
  } catch (e) {
    loadError.value = `词库加载失败：${(e as Error).message}`
  }
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>四六级背单词</h1>
      <div class="stats">
        <span>已标记 {{ stats.marked }} / {{ stats.total }}</span>
        <span class="known">熟词 {{ stats.known }}</span>
        <span class="unknown">生词 {{ stats.unknown }}</span>
      </div>
    </header>

    <p
      class="backend"
      :class="backendOk === true ? 'ok' : backendOk === false ? 'fail' : ''"
    >
      {{ backendText }}
    </p>

    <main class="main">
      <p v-if="loadError" class="load-error">{{ loadError }}</p>
      <template v-else>
        <WordCard v-if="currentWord" :word="currentWord" />
        <p v-else class="loading">正在加载词库…</p>
        <ActionBar v-if="currentWord" @mark="mark" />
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

h1 {
  font-size: 20px;
  margin: 0;
  color: #111827;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.stats .known {
  color: #166534;
}

.stats .unknown {
  color: #991b1b;
}

.backend {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
}

.backend.ok {
  color: #166534;
}

.backend.fail {
  color: #991b1b;
}

.loading,
.load-error {
  text-align: center;
  color: #6b7280;
}

.load-error {
  color: #991b1b;
}
</style>