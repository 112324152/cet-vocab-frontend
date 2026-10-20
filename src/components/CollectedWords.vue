<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CollectedWord } from '../types/dict'

const emit = defineEmits<{ close: [] }>()

const loading = ref(true)
const error = ref('')
const words = ref<CollectedWord[]>([])

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}-${day}`
  } catch {
    return ''
  }
}

function cleanMeaning(raw: string): string {
  if (!raw) return ''
  return raw.replace(/\\n/g, '\n').split('\n')[0]
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/collected')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    words.value = await res.json()
  } catch (e) {
    error.value = `加载失败：${(e as Error).message}`
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <header class="panel-header">
        <div class="title">收集本 · {{ words.length }}</div>
        <button class="close" @click="emit('close')">×</button>
      </header>

      <div class="body">
        <p v-if="loading" class="hint">正在加载…</p>
        <p v-else-if="error" class="hint error">{{ error }}</p>
        <p v-else-if="words.length === 0" class="hint">
          还没有收藏。去"阅读收集"里粘贴一段英文，点蓝色生词就能收藏。
        </p>

        <ul v-else class="list">
          <li v-for="w in words" :key="w.id">
            <div class="row-main">
              <span class="word">{{ w.word }}</span>
              <span v-if="w.phonetic" class="phonetic">/{{ w.phonetic }}/</span>
              <span class="date">{{ formatDate(w.collectedAt) }}</span>
            </div>
            <div v-if="w.translation" class="translation">
              {{ cleanMeaning(w.translation) }}
            </div>
            <div v-else class="translation muted">词典中未收录</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 20px;
}

.panel {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.title {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  padding: 4px 8px;
  min-width: 44px;
  min-height: 44px;
}

.body {
  padding: 8px 18px 18px;
  overflow-y: auto;
}

.hint {
  text-align: center;
  color: #9ca3af;
  padding: 24px 0;
  font-size: 14px;
  line-height: 1.6;
}

.hint.error {
  color: #991b1b;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list li {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.list li:last-child {
  border-bottom: none;
}

.row-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.word {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}

.phonetic {
  font-size: 13px;
  color: #9ca3af;
}

.date {
  font-size: 12px;
  color: #d1d5db;
  margin-left: auto;
}

.translation {
  font-size: 14px;
  color: #374151;
  margin-top: 4px;
  line-height: 1.5;
  white-space: pre-line;
}

.translation.muted {
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 480px) {
  .overlay {
    padding: 0;
    align-items: flex-end;
  }

  .panel {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .body {
    padding: 8px 14px calc(14px + env(safe-area-inset-bottom));
  }
}
</style>