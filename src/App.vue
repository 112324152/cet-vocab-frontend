<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ActionBar from './components/ActionBar.vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import ChatPanel from './components/ChatPanel.vue'
import CollectedWords from './components/CollectedWords.vue'
import LoginPage from './components/LoginPage.vue'
import TextReader from './components/TextReader.vue'
import WordCard from './components/WordCard.vue'
import { useAuth } from './composables/useAuth'
import { useWordSession } from './composables/useWordSession'
import type { Word } from './types/word'

const { user, state: authState, check, logout } = useAuth()
const { currentWord, stats, busy, init, mark } = useWordSession()

const backendOk = ref<boolean | null>(null)
const loadError = ref('')
const chatOpen = ref(false)
const chatWord = ref<Word | null>(null)
const analyticsOpen = ref(false)
const readerOpen = ref(false)
const collectedOpen = ref(false)

const backendText = computed(() => {
  if (backendOk.value === null) return '正在检查后端…'
  return backendOk.value ? '后端已连接' : '后端未连接'
})

function openChat() {
  if (!currentWord.value) return
  chatWord.value = currentWord.value
  chatOpen.value = true
}

async function bootstrap() {
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
}

onMounted(async () => {
  await check()
})

watch(authState, async (s) => {
  if (s === 'ready') {
    loadError.value = ''
    await bootstrap()
  }
})
</script>

<template>
  <div v-if="authState === 'loading'" class="splash">正在加载…</div>

  <LoginPage v-else-if="authState === 'need-login'" />

  <div v-else class="app">
    <header class="header">
      <div class="title-row">
        <h1>四六级背单词</h1>
        <div class="actions">
          <button class="top-btn" @click="readerOpen = true">阅读收集</button>
          <button class="top-btn" @click="collectedOpen = true">收集本</button>
          <button class="top-btn" @click="analyticsOpen = true">学习数据</button>
        </div>
      </div>
      <div class="user-line">
        <span class="user-name">{{ user?.displayName }}</span>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
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

    <AnalyticsPanel v-if="analyticsOpen" @close="analyticsOpen = false" />

    <TextReader v-if="readerOpen" @close="readerOpen = false" />

    <CollectedWords v-if="collectedOpen" @close="collectedOpen = false" />
  </div>
</template>

<style scoped>
.splash {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}

.app {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 20px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

h1 {
  font-size: 20px;
  margin: 0;
  color: #111827;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 6px;
}

.top-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  min-height: 36px;
  white-space: nowrap;
}

.top-btn:hover {
  background: #f9fafb;
}

.user-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.logout-btn {
  border: 0;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}

.logout-btn:hover {
  color: #6b7280;
  text-decoration: underline;
}

.stats {
  display: flex;
  flex-wrap: wrap;
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

@media (max-width: 480px) {
  .app {
    padding: 16px 14px calc(16px + env(safe-area-inset-bottom));
  }

  h1 {
    font-size: 17px;
  }

  .title-row {
    align-items: flex-start;
  }

  .actions {
    flex-wrap: wrap;
    gap: 4px;
  }

  .top-btn {
    padding: 5px 10px;
    font-size: 12px;
    min-height: 32px;
  }

  .stats {
    font-size: 12px;
  }

  .backend {
    margin-bottom: 12px;
    font-size: 12px;
  }
}
</style>