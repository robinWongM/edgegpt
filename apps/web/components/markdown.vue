<script setup lang="ts">
import { computedWithControl } from "@vueuse/core";

const props = defineProps<{
  content?: string;
}>();

const rendered = computedWithControl(
  () => props.content,
  () => markdownIt.render(props.content ?? "")
);
</script>

<template>
  <div>
    <div v-if="$props.content" v-html="rendered" />
  </div>
</template>

<style scoped>
:deep(p),
:deep(pre),
:deep(ul),
:deep(ol) {
  @apply my-2;
}

:deep(hr) {
  @apply my-4;
}

:deep(ul li),
:deep(ol li) {
  @apply my-2 list-initial ml-4;
}

:deep(a) {
  @apply bg-secondary text-secondary-content rounded-lg px-2 py-1 text-xs inline-block;
}

:deep(a:has(sup)) {
  @apply bg-transparent p-0 leading-200% ml-0.5;
}

:deep(a sup) {
  @apply bg-secondary px-1 rounded -top-2;
}

:deep(pre) {
  @apply p-4 overflow-x-auto;
}

:deep(code) {
  @apply kbd kbd-sm;
}

</style>
