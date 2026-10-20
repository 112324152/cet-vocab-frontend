<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LookupResult } from '../types/dict'

const emit = defineEmits<{ close: [] }>()

type Mode = 'edit' | 'reading'
type WordStatus = 'unknown' | 'known' | 'collected'

interface Token {
  text: string
  isWord: boolean
  lower: string
  status: WordStatus
}

const WORD_PATTERN = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g

const mode = ref<Mode>('edit')
const rawText = ref('')
const tokens = ref<Token[]>([])
const dictMap = ref<Map<string, LookupResult>>(new Map())
const collectedSet = ref<Set<string>>(new Set())
const loading = ref(false)
const errorMsg = ref('')

const selected = ref<{
  word: string
  phonetic: string
  translation: string
  inDict: boolean
} | null>(null)

const collecting = ref(false)
const collectMessage = ref('')

const alreadyCollected = computed(() => {
  if (!selected.value) return false
  return collectedSet.value.has(selected.value.word)
})

function tokenize(text: string): Token[] {
  const result: Token[] = []
  let lastIndex = 0
  const regex = new RegExp(WORD_PATTERN.source, 'g')
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      result.push({
        text: text.slice(lastIndex, m.index),
        isWord: false,
        lower: '',
        status: 'unknown',
      })
    }
    result.push({
      text: m[0],
      isWord: true,
      lower: m[0].toLowerCase(),
      status: 'unknown',
    })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) {
    result.push({
      text: text.slice(lastIndex),
      isWord: false,
      lower: '',
      status: 'unknown',
    })
  }
  return result
}

async function analyze() {
  const text = rawText.value.trim()
  if (!text) return
  loading.value = true
  errorMsg.value = ''
  selected.value = null

  try {
    const baseTokens = tokenize(text)
    const uniqueWords = new Set<string>()
    for (const t of baseTokens) {
      if (t.isWord) uniqueWords.add(t.lower)
    }

    const wordList = Array.from(uniqueWords).slice(0, 500)
    let dictResults: LookupResult[] = []
    if (wordList.length > 0) {
      const res = await fetch('/api/lookup/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: wordList }),
      })
      if (res.ok) dictResults = await res.json()
    }

    const map = new Map<string, LookupResult>()
    for (const r of dictResults) map.set(r.word, r)
    dictMap.value = map

    try {
      const cres = await fetch('/api/collected')
      if (cres.ok) {
        const list = (await cres.json()) as { word: string }[]
        collectedSet.value = new Set(list.map((x) => x.word))
      }
    } catch {
      // 静默
    }

    for (const t of baseTokens) {
      if (!t.isWord) continue
      if (collectedSet.value.has(t.lower)) t.status = 'collected'
      else if (map.has(t.lower)) t.status = 'known'
      else t.status = 'unknown'
    }

    tokens.value = baseTokens
    mode.value = 'reading'
  } catch (e) {
    errorMsg.value = `分析失败：${(e as Error).message}`
  } finally {
    loading.value = false
  }
}

function openWord(t: Token) {
  if (!t.isWord) return
  const info = dictMap.value.get(t.lower)
  selected.value = {
    word: t.lower,
    phonetic: info?.phonetic || '',
    translation: info?.translation || '词典中未收录，可加入收集本',
    inDict: !!info,
  }
  collecting.value = false
  collectMessage.value = ''
}

async function collect() {
  const w = selected.value
  if (!w || collecting.value) return
  collecting.value = true
  collectMessage.value = ''
  try {
    const res = await fetch('/api/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: w.word, context: '' }),
    })
    if (!res.ok) {
      collectMessage.value = `收藏失败 (HTTP ${res.status})`
      return
    }
    collectedSet.value.add(w.word)
    for (const t of tokens.value) {
      if (t.isWord && t.lower === w.word) t.status = 'collected'
    }
    collectMessage.value = '已收藏'
  } catch (e) {
    collectMessage.value = `网络错误：${(e as Error).message}`
  } finally {
    collecting.value = false
  }
}

function closePopup() {
  selected.value = null
  collectMessage.value = ''
}

function backToEdit() {
  mode.value = 'edit'
  selected.value = null
  collectMessage.value = ''
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <header class="panel-header">
        <div class="title">
          阅读收集
          <span class="version">v2</span>
        </div>
        <button class="close" @click="emit('close')">×</button>
      </header>

      <div class="body">
        <template v-if="mode === 'edit'">
          <p class="hint">把一段英文粘贴进来，自动标出你还没掌握的单词。</p>
          <textarea
            v-model="rawText"
            class="input"
            rows="10"
            placeholder="Paste the English text here…"
          />
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
          <button
            class="primary"
            :disabled="!rawText.trim() || loading"
            @click="analyze"
          >
            {{ loading ? '分析中…' : '分析' }}
          </button>
        </template>

        <template v-else>
          <div class="toolbar">
            <button class="back" @click="backToEdit">← 重新粘贴</button>
            <div class="legend">
              <span class="dot known"></span>词库
              <span class="dot unknown"></span>生词
              <span class="dot collected"></span>已收藏
            </div>
          </div>

          <div class="reading">
            <template v-for="(t, i) in tokens" :key="i">
              <span
                v-if="t.isWord"
                class="token"
                :class="'st-' + t.status"
                @click="openWord(t)"
              >{{ t.text }}</span>
              <span v-else>{{ t.text }}</span>
            </template>
          </div>
        </template>
      </div>

      <div v-if="selected" class="popup" @click.self="closePopup">
        <div class="popup-inner">
          <div class="popup-header">
            <div class="popup-title">
              <span class="popup-word">{{ selected.word }}</span>
              <span v-if="selected.phonetic" class="popup-phonetic">
                /{{ selected.phonetic }}/
              </span>
              <span v-if="alreadyCollected" class="collected-badge">已收藏</span>
            </div>
            <button class="popup-close" @click="closePopup">×</button>
          </div>
          <p class="popup-translation">{{ selected.translation }}</p>
          <p v-if="collectMessage" class="popup-msg">{{ collectMessage }}</p>
          <div class="popup-actions">
            <button
              class="primary small"
              :disabled="collecting"
              @click="collect"
            >
              {{ collecting ? '收藏中…' : alreadyCollected ? '再收藏一次' : '收藏' }}
            </button>
          </div>
        </div>
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
  align-items: stretch;
  justify-content: center;
  z-index: 20;
}

.panel {
  width: 100%;
  max-width: 720px;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.version {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 6px;
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
  flex: 1;
  overflow-y: auto;
  padding: 18px;
}

.hint {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 12px;
}

.input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px;
  font: inherit;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
}

.error {
  color: #991b1b;
  font-size: 13px;
  margin: 8px 0 0;
}

.primary {
  margin-top: 12px;
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  font-size: 15px;
  padding: 12px 24px;
  min-height: 44px;
  width: 100%;
}

.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary.small {
  width: auto;
  padding: 8px 20px;
  margin-top: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.back {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  min-height: 36px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 2px;
  vertical-align: middle;
}

.dot.known { background: #e5e7eb; }
.dot.unknown { background: #93c5fd; }
.dot.collected { background: #86efac; }

.reading {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.9;
  font-size: 16px;
  color: #111827;
}

.token {
  cursor: pointer;
  border-radius: 3px;
  padding: 0 1px;
  transition: background-color 0.1s;
}

.token:hover {
  background: #f3f4f6;
}

.token.st-known {
  color: #6b7280;
}

.token.st-unknown {
  color: #1e40af;
  border-bottom: 2px solid #93c5fd;
}

.token.st-collected {
  color: #15803d;
  border-bottom: 2px solid #86efac;
}

.popup {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 5;
}

.popup-inner {
  width: 100%;
  max-width: 720px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px 18px calc(16px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.popup-word {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.popup-phonetic {
  font-size: 14px;
  color: #9ca3af;
}

.collected-badge {
  font-size: 11px;
  color: #166534;
  background: #dcfce7;
  border-radius: 4px;
  padding: 1px 6px;
}

.popup-close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  padding: 4px 8px;
  min-width: 44px;
  min-height: 44px;
}

.popup-translation {
  margin: 8px 0 14px;
  color: #1f2937;
  font-size: 15px;
  white-space: pre-line;
  line-height: 1.6;
}

.popup-msg {
  margin: -6px 0 10px;
  color: #6b7280;
  font-size: 13px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .panel {
    max-width: 100%;
  }

  .body {
    padding: 12px;
  }

  .reading {
    font-size: 15px;
    line-height: 1.8;
  }
}
</style>