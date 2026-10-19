import { ref, watch } from 'vue'
import type { WordFamily } from '../types/word'

const RELATION_LABELS: Record<string, string> = {
  p: '过去式',
  d: '过去分词',
  i: '现在分词',
  '3': '第三人称单数',
  s: '复数',
  r: '比较级',
  t: '最高级',
}

export function relationLabel(relation: string): string {
  return relation
    .split(',')
    .map((r) => RELATION_LABELS[r] ?? r)
    .join('/')
}

export function useWordFamily(wordId: () => number | undefined) {
  const family = ref<WordFamily | null>(null)
  const loading = ref(false)

  async function load() {
    const id = wordId()
    if (!id) return
    loading.value = true
    family.value = null
    try {
      const res = await fetch(`/api/words/${id}/family`)
      if (res.ok) {
        const data: WordFamily = await res.json()
        if (data.members.length > 0) {
          family.value = data
        }
      }
    } catch {
      // 静默失败，不打断主流程
    } finally {
      loading.value = false
    }
  }

  watch(wordId, () => {
    load()
  })

  return { family, loading, reload: load }
}