<script setup lang="ts">
import ActionBar from './components/ActionBar.vue'
import WordCard from './components/WordCard.vue'
import { useWordSession } from './composables/useWordSession'

const { currentWord, stats, mark } = useWordSession()
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>四六级背单词</h1>
      <div class="stats">
        <span>已标记 {{ stats.marked }} / {{ stats.total }}</span>
        <span class="known">熟词 {{ stats.known }}</span>
        <span class="unknown">生词 {{ stats.unknown }}</span>
      </div>
    </header>

    <main class="main">
      <WordCard v-if="currentWord" :word="currentWord" />
      <ActionBar @mark="mark" />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

h1 {
  font-size: 20px;
  margin: 0;
  color: #111827;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.stats .known {
  color: #166534;
}

.stats .unknown {
  color: #991b1b;
}
</style>