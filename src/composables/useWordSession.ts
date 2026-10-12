import { computed, ref } from 'vue'
import type { Word, WordState } from '../types/word'
import { mockWords } from '../data/mockWords'

// 每种状态的抽中权重：生词多推，熟词少推。
// 这是演示版的简化算法，正式版（复习间隔、衍生词推荐）会做在后端。
const WEIGHTS: Record<WordState, number> = {
  new: 2,
  unknown: 4,
  known: 1,
}

export function useWordSession(words: Word[] = mockWords) {
  // 每个词当前的状态，初始都为 new
  const states = ref<Record<number, WordState>>({})
  for (const w of words) {
    states.value[w.id] = 'new'
  }

  const currentWord = ref<Word | null>(null)
  const lastId = ref<number | null>(null)

  const stats = computed(() => {
    const all = Object.values(states.value)
    return {
      total: words.length,
      marked: all.filter((s) => s !== 'new').length,
      known: all.filter((s) => s === 'known').length,
      unknown: all.filter((s) => s === 'unknown').length,
    }
  })

  function pickNext(): Word {
    // 先排除上一张，避免连续抽到同一个词
    const rest = words.filter((w) => w.id !== lastId.value)
    const candidates = rest.length > 0 ? rest : words

    // 加权随机
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

  // 标记当前词，然后自动切换下一张
  function mark(state: 'known' | 'unknown') {
    if (!currentWord.value) return
    states.value[currentWord.value.id] = state
    next()
  }

  next()

  return { currentWord, stats, states, next, mark }
}