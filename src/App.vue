<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionBar from './components/ActionBar.vue'
import ChatPanel from './components/ChatPanel.vue'
import WordCard from './components/WordCard.vue'
import { useWordSession } from './composables/useWordSession'
import type { Word } from './types/word'

const { currentWord, stats, busy, init, mark } = useWordSession()

const backendOk = ref<boolean | null>(null)
const loadError = ref('')
const chatOpen = ref(false)
const chatWord = ref<Word | null>(null)

const backendText = computed(() => {
  if (backendOk.value === null) return '正在检查后端…'
  return backendOk.value ? '后端已连接' : '后端未连接'
})

function openChat() {
  if (!currentWord.value) return
  chatWord.value = currentWord.value
  chatOpen.value = true
}

onMounted(async () => {
  try {
    const health = await fetch('/api/health')
    backendOk.value = health.ok
  } catch {
    backendOk.value = false
  }

  try {
    await init()
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
        <span class="due">待复习 {{ stats.dueNow }}</span>
        <span>未学 {{ stats.newCount }}</span>
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
        <WordCard v-if="currentWord" :word="currentWord" @ask="openChat" />
        <p v-else class="loading">正在加载…</p>
        <ActionBar :disabled="busy" @mark="mark" />
      </template>
    </main>

    <ChatPanel
      v-if="chatOpen && chatWord"
      :word="chatWord"
      @close="chatOpen = false"
    />
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
  gap: 8px;
  margin-bottom: 8px;
}

h1 {
  font-size: 20px;
  margin: 0;
  color: #111827;
  white-space: nowrap;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px 10px;
  font-size: 13px;
  color: #6b7280;
}

.stats .due {
  color: #b45309;
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

/* ---------- 手机适配 ---------- */
@media (max-width: 480px) {
  .app {
    padding: 16px 14px calc(16px + env(safe-area-inset-bottom));
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 6px;
  }

  h1 {
    font-size: 17px;
  }

  .stats {
    font-size: 12px;
    justify-content: flex-start;
    width: 100%;
  }

  .backend {
    margin-bottom: 12px;
    font-size: 12px;
  }
}
</style>