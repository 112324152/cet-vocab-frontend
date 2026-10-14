<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import type { Word } from '../types/word'

const props = defineProps<{ word: Word }>()
const emit = defineEmits<{ close: [] }>()

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const input = ref('')
const messages = ref<ChatMsg[]>([])
const streaming = ref(false)
const error = ref('')
const listRef = ref<HTMLElement | null>(null)

const QUICK_QUESTIONS = [
  '这个词怎么用？',
  '给我两个例句',
  '词根词缀是什么？',
  '和它易混淆的词有哪些？',
]

async function scrollToBottom() {
  await nextTick()
  listRef.value?.scrollTo({ top: listRef.value.scrollHeight })
}

async function ask(question: string) {
  const text = question.trim()
  if (!text || streaming.value) return

  input.value = ''
  error.value = ''
  messages.value.push({ role: 'user', content: text })
  const assistant = reactive<ChatMsg>({ role: 'assistant', content: '' })
  messages.value.push(assistant)
  streaming.value = true
  await scrollToBottom()

  try {
    const res = await fetch(`/api/words/${props.word.id}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text }),
    })
    if (!res.ok || !res.body) {
      throw new Error(`HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finished = false

    while (!finished) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        const line = block.trim()
        if (!line.startsWith('data:')) continue

        const jsonText = line.slice(5).trim()
        if (!jsonText) continue

        const payload = JSON.parse(jsonText) as {
          delta?: string
          done?: boolean
          error?: string
        }

        if (payload.error) {
          error.value = `AI 回答失败：${payload.error}`
          finished = true
          break
        }
        if (payload.delta) {
          assistant.content += payload.delta
          await scrollToBottom()
        }
        if (payload.done) {
          finished = true
          break
        }
      }
    }
  } catch (e) {
    error.value = `请求失败：${(e as Error).message}`
  } finally {
    streaming.value = false
    await scrollToBottom()
  }
}

function onEnter(e: KeyboardEvent) {
  if (e.isComposing) return
  if (!e.shiftKey) {
    e.preventDefault()
    ask(input.value)
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <header class="panel-header">
        <div class="title">问 AI：{{ word.text }}</div>
        <button class="close" @click="emit('close')">×</button>
      </header>

      <div ref="listRef" class="list">
        <p v-if="messages.length === 0" class="empty">
          点下面的问题直接问，也可以自己输入。
        </p>

        <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
          {{ m.content || '思考中…' }}
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div v-if="messages.length === 0" class="quick">
        <button
          v-for="q in QUICK_QUESTIONS"
          :key="q"
          :disabled="streaming"
          @click="ask(q)"
        >
          {{ q }}
        </button>
      </div>

      <div class="composer">
        <textarea
          v-model="input"
          rows="2"
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          @keydown.enter="onEnter"
        />
        <button :disabled="streaming || !input.trim()" @click="ask(input)">
          {{ streaming ? '回答中…' : '发送' }}
        </button>
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
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
}

.panel {
  width: 100%;
  max-width: 560px;
  height: 72vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.title {
  font-weight: 600;
  color: #111827;
}

.close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  padding: 4px 8px;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  color: #9ca3af;
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}

.msg {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}

.msg.user {
  align-self: flex-end;
  background: #eef2ff;
  color: #1e3a8a;
}

.msg.assistant {
  align-self: flex-start;
  background: #f3f4f6;
  color: #1f2937;
}

.error {
  color: #991b1b;
  font-size: 13px;
}

.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 12px;
}

.quick button {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
}

.quick button:disabled {
  opacity: 0.5;
}

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.composer textarea {
  resize: none;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px;
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.composer button {
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  padding: 0 18px;
  font-size: 14px;
}

.composer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>