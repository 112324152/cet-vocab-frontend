<script setup lang="ts">
const emit = defineEmits<{
  mark: [state: 'known' | 'unknown']
}>()
</script>

<template>
  <div class="action-bar">
    <button class="unknown" @click="emit('mark', 'unknown')">
      不认识 · 生词
    </button>
    <button class="known" @click="emit('mark', 'known')">
      认识 · 熟词
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.action-bar button {
  padding: 16px;
  border: 0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: opacity 0.15s;
}

.action-bar button:hover {
  opacity: 0.85;
}

.unknown {
  background: #fee2e2;
  color: #991b1b;
}

.known {
  background: #dcfce7;
  color: #166534;
}
</style>