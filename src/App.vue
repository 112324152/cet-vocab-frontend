<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoginPage from './components/LoginPage.vue'
import NavBar from './components/NavBar.vue'
import { useAuth } from './composables/useAuth'
import { useWordSession } from './composables/useWordSession'

const { user, state: authState, check, logout: authLogout } = useAuth()
const router = useRouter()

const session = useWordSession()
provide('wordSession', session)

const backendOk = ref<boolean | null>(null)
const loadError = ref('')

const backendText = computed(() => {
  if (backendOk.value === null) return '正在检查后端…'
  return backendOk.value ? '后端已连接' : '后端未连接'
})

async function bootstrap() {
  try {
    const health = await fetch('/api/health')
    backendOk.value = health.ok
  } catch {
    backendOk.value = false
  }

  try {
    await session.init()
  } catch (e) {
    loadError.value = `词库加载失败：${(e as Error).message}`
  }
}

async function logout() {
  await authLogout()
  router.push('/')
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

provide('appStatus', { backendOk, backendText, loadError })
</script>

<template>
  <div v-if="authState === 'loading'" class="splash">正在加载…</div>

  <LoginPage v-else-if="authState === 'need-login'" />

  <div v-else class="shell">
    <header class="topbar">
      <span class="logo">四六级背单词</span>
      <div class="user-info">
        <span class="user-name">{{ user?.displayName }}</span>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </header>

    <div class="body">
      <main class="content">
        <router-view />
      </main>
      <NavBar />
    </div>
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

.shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.logo {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.user-name { color: #374151; }

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

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

@media (min-width: 769px) {
  .body { flex-direction: row; }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 24px;
  }
}
</style>
