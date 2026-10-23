<script setup lang="ts">
import TextReader from '../components/TextReader.vue'
</script>

<template>
  <div class="embed">
    <TextReader />
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
  max-width: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.embed :deep(.panel-header) {
  display: none;
}

.embed :deep(.popup) {
  position: fixed;
  inset: 0;
  z-index: 50;
}
</style>
