<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Word } from '../types/word'

const props = defineProps<{ word: Word }>()
const emit = defineEmits<{ ask: [] }>()

const revealed = ref(false)
watch(
  () => props.word.id,
  () => {
    revealed.value = false
  },
)
</script>

<template>
  <div class="word-card">
    <span class="level">{{ word.level }}</span>

    <div class="word">{{ word.text }}</div>
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

.word {
  font-size: 42px;
  font-weight: 700;
  color: #111827;
  word-break: break-word;
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