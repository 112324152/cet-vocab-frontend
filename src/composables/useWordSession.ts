import { ref } from 'vue'
import type { Stats, Word } from '../types/word'

export function useWordSession() {
  const currentWord = ref<Word | null>(null)
  const stats = ref<Stats>({
    total: 0,
    newCount: 0,
    dueNow: 0,
    known: 0,
    unknown: 0,
  })
  const busy = ref(false)

  async function loadStats() {
    const res = await fetch('/api/stats')
    if (res.ok) {
      stats.value = await res.json()
    }
  }

  async function next() {
    const excludeId = currentWord.value?.id
    const url = excludeId
      ? `/api/words/next?excludeId=${excludeId}`
      : '/api/words/next'

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    currentWord.value = await res.json()
  }

  async function mark(state: 'known' | 'unknown') {
    if (!currentWord.value || busy.value) return
    busy.value = true
    try {
      const res = await fetch(`/api/words/${currentWord.value.id}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      await Promise.all([next(), loadStats()])
    } finally {
      busy.value = false
    }
  }

  async function init() {
    await loadStats()
    await next()
  }

  return { currentWord, stats, busy, init, next, mark }
}
