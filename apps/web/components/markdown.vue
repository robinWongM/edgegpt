<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import MarkdownItFootnote from 'markdown-it-footnote';
import { setCDN, getHighlighter } from 'shiki'

const props = defineProps<{
  content?: string;
}>();

setCDN('https://cdn.jsdelivr.net/npm/shiki/');
const highlighter = await getHighlighter({
  theme: 'nord',
});

const markdownIt = MarkdownIt({
  typographer: true,
  highlight: (str, lang) => highlighter.codeToHtml(str, { lang }),
});

markdownIt.use(MarkdownItFootnote);

const rendered = computed(() => {
  return markdownIt.render(props.content ?? '');
});

</script>

<template>
  <div v-if="$props.content" v-html="rendered" />
</template>

<style scoped>
:deep(p), :deep(pre), :deep(ul), :deep(ol) {
  @apply my-4;
}

:deep(ul li), :deep(ol li) {
  @apply my-2 list-initial ml-4;
}

:deep(a) {
  @apply text-primary;
}

:deep(pre) {
  @apply p-4;
}

:deep(pre) {
  @apply overflow-x-auto;
}
</style>