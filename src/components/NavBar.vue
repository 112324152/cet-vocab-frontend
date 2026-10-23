<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/', label: '学习', icon: '📖' },
  { path: '/records', label: '记录', icon: '📅' },
  { path: '/reader', label: '阅读', icon: '📄' },
  { path: '/collected', label: '收集', icon: '⭐' },
]

function isActive(path: string): boolean {
  return route.path === path
}

function go(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <nav class="nav">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="nav-item"
      :class="{ active: isActive(tab.path) }"
      @click="go(tab.path)"
    >
      <span class="icon">{{ tab.icon }}</span>
      <span class="label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
  border: 0;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.15s;
  min-height: 52px;
}

.nav-item .icon {
  font-size: 20px;
  line-height: 1;
}

.nav-item.active {
  color: #2563eb;
}

.nav-item:active {
  background: #f9fafb;
}

@media (min-width: 769px) {
  .nav {
    flex-direction: column;
    border-top: 0;
    border-right: 1px solid #e5e7eb;
    width: 88px;
    justify-content: flex-start;
    padding-top: 12px;
  }

  .nav-item {
    flex: 0 0 auto;
    padding: 14px 4px;
    font-size: 12px;
  }

  .nav-item .icon {
    font-size: 22px;
    margin-bottom: 4px;
  }
}
</style>
