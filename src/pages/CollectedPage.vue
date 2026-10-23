<script setup lang="ts">
import CollectedWords from '../components/CollectedWords.vue'
</script>

<template>
  <div class="embed">
    <CollectedWords />
  </div>
</template>

<style scoped>
.embed {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.embed :deep(.overlay) {
  position: static;
  background: transparent;
  padding: 0;
  display: block;
  min-height: 0;
}

.embed :deep(.panel) {
  max-height: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.embed :deep(.close) {
  display: none;
}
</style>
