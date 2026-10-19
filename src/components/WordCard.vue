<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Word } from '../types/word'
import { useSpeech } from '../composables/useSpeech'

const props = defineProps<{ word: Word }>()
const emit = defineEmits<{ ask: [] }>()

const revealed = ref(false)
watch(
  () => props.word.id,
  () => {
    revealed.value = false
  },
)

const { supported, speak } = useSpeech()

function pronounce() {
  speak(props.word.text)
}
</script>

<template>
  <div class="word-card">
    <span class="level">{{ word.level }}</span>

    <div class="word-row">
      <span class="word">{{ word.text }}</span>
      <button
        v-if="supported"
        class="speak"
        type="button"
        aria-label="播放发音"
        @click="pronounce"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>
    </div>

    <div class="phonetic">{{ word.phonetic }}</div>

    <div v-if="revealed" class="answer">
      <ul class="meanings">
        <li v-for="m in word.meanings" :key="m">{{ m }}</li>
      </ul>
      <p v-if="word.example" class="example">{{ word.example }}</p>
    </div>

    <button v-else class="reveal" @click="revealed = true">
      显示释义
    </button>

    <button class="ask" @click="emit('ask')">问 AI</button>
  </div>
</template>

<style scoped>
.word-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.level {
  font-size: 12px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 2px 10px;
}

.word-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

.word {
  font-size: 42px;
  font-weight: 700;
  color: #111827;
  word-break: break-word;
  text-align: center;
}

.speak {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #2563eb;
  transition: background-color 0.15s;
}

.speak:hover {
  background: #eff6ff;
}

.speak:active {
  background: #dbeafe;
}

.phonetic {
  color: #6b7280;
  font-size: 15px;
}

.answer {
  margin-top: 8px;
  width: 100%;
}

.meanings {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
  color: #1f2937;
  line-height: 1.8;
}

.example {
  margin: 0;
  color: #6b7280;
  font-style: italic;
  font-size: 14px;
}

.reveal {
  margin-top: 12px;
  padding: 10px 24px;
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  font-size: 15px;
}

.reveal:hover {
  background: #f9fafb;
}

.ask {
  margin-top: 4px;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: 15px;
  padding: 8px 12px;
}

.ask:hover {
  text-decoration: underline;
}

/* ---------- 手机适配 ---------- */
@media (max-width: 480px) {
  .word-card {
    padding: 28px 18px;
    min-height: 240px;
    gap: 8px;
  }

  .word {
    font-size: 34px;
  }

  .phonetic {
    font-size: 14px;
  }

  .meanings {
    line-height: 1.7;
    font-size: 15px;
  }

  .example {
    font-size: 13px;
  }
}
</style>