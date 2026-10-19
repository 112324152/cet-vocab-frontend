<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Word } from '../types/word'
import { useSpeech } from '../composables/useSpeech'
import { relationLabel, useWordFamily } from '../composables/useWordFamily'

const props = defineProps<{ word: Word }>()
const emit = defineEmits<{ ask: [] }>()

const revealed = ref(false)
const familyExpanded = ref(false)
const { speak, stop, speaking } = useSpeech()
const { family } = useWordFamily(() => props.word.id)

watch(
  () => props.word.id,
  () => {
    revealed.value = false
    familyExpanded.value = false
    stop()
  },
)

function pronounce() {
  speak(props.word.id)
}

function cleanMeaning(raw: string): string {
  // ECDICT 用字面量 \n 分隔多个义项，需要转成真换行
  return raw.replace(/\\n/g, '\n')
}
</script>

<template>
  <div class="word-card">
    <span class="level">{{ word.level }}</span>

    <div class="word-row">
      <span class="word">{{ word.text }}</span>
      <button
        class="speak"
        :class="{ playing: speaking }"
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

    <div v-if="family && family.members.length > 0" class="family">
      <button class="family-toggle" @click="familyExpanded = !familyExpanded">
        <span>词族 · {{ family.members.length }} 个变形</span>
        <span class="caret" :class="{ open: familyExpanded }">▾</span>
      </button>
      <ul v-if="familyExpanded" class="family-list">
        <li v-for="m in family.members" :key="m.text + m.relation">
          <div class="member-main">
            <span class="member-text">{{ m.text }}</span>
            <span class="member-rel">{{ relationLabel(m.relation) }}</span>
          </div>
          <div v-if="m.phonetic" class="member-phonetic">/{{ m.phonetic }}/</div>
          <div v-if="m.meaning" class="member-meaning">
            {{ cleanMeaning(m.meaning) }}
          </div>
        </li>
      </ul>
    </div>

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

.speak.playing {
  background: #dbeafe;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
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

.family {
  width: 100%;
  margin-top: 4px;
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}

.family-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  padding: 8px 4px;
  color: #2563eb;
  font-size: 14px;
  text-align: left;
}

.caret {
  transition: transform 0.2s;
  display: inline-block;
}

.caret.open {
  transform: rotate(180deg);
}

.family-list {
  list-style: none;
  padding: 0 4px;
  margin: 4px 0 0;
  text-align: left;
}

.family-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #f3f4f6;
}

.family-list li:last-child {
  border-bottom: none;
}

.member-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.member-text {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.member-rel {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 6px;
}

.member-phonetic {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.member-meaning {
  font-size: 13px;
  color: #374151;
  margin-top: 2px;
  line-height: 1.5;
  white-space: pre-line;
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