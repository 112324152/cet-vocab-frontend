import { computed, ref } from 'vue'
import type { Word, WordState } from '../types/word'

// 每种状态的抽中权重：生词多推，熟词少推。
const WEIGHTS: Record<WordState, number> = {
  new: 2,
  unknown: 4,
  known: 1,
}

export function useWordSession() {
  const states = ref<Record<number, WordState>>({})
  const currentWord = ref<Word | null>(null)
  const lastId = ref<number | null>(null)

  // 词库通过 init() 注入，不再直接依赖本地 mock 数据
  let allWords: Word[] = []

  const stats = computed(() => {
    const all = Object.values(states.value)
    return {
      total: allWords.length,
      marked: all.filter((s) => s !== 'new').length,
      known: all.filter((s) => s === 'known').length,
      unknown: all.filter((s) => s === 'unknown').length,
    }
  })

  function init(words: Word[]) {
    allWords = words
    const map: Record<number, WordState> = {}
    for (const w of words) {
      map[w.id] = 'new'
    }
    states.value = map
    if (words.length > 0) next()
  }

  function pickNext(): Word {
    const rest = allWords.filter((w) => w.id !== lastId.value)
    const candidates = rest.length > 0 ? rest : allWords

    const totalWeight = candidates.reduce(
      (sum, w) => sum + WEIGHTS[states.value[w.id]],
      0,
    )
    let roll = Math.random() * totalWeight
    for (const w of candidates) {
      roll -= WEIGHTS[states.value[w.id]]
      if (roll <= 0) return w
    }
    return candidates[candidates.length - 1]
  }

  function next() {
    const word = pickNext()
    currentWord.value = word
    lastId.value = word.id
  }

  function mark(state: 'known' | 'unknown') {
    if (!currentWord.value) return
    states.value[currentWord.value.id] = state
    next()
  }

  return { currentWord, stats, states, init, next, mark }
}