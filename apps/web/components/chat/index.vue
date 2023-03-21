<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";

const props = defineProps<{
  chatId: string;
}>();

provide(
  "chatId",
  computed(() => props.chatId)
);

const container = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const shouldStickToBottom = ref(true);
const updateShouldStickToBottom = () => {
  const { scrollHeight, clientHeight, scrollTop } = container.value!;
  shouldStickToBottom.value = scrollHeight - clientHeight - scrollTop < 100;
};

const scrollToBottom = () => {
  if (!container.value) {
    return;
  }

  const { scrollHeight, clientHeight } = container.value!;
  container.value!.scrollTop = scrollHeight - clientHeight;
};

useResizeObserver(content, () => {
  if (!shouldStickToBottom.value) {
    return;
  }

  scrollToBottom();
});
</script>

<template>
  <div class="h-full overflow-y-auto" ref="container" @scroll="updateShouldStickToBottom">
    <div class="flex flex-col min-h-full" ref="content">
      <TopBar />
      <ChatMessages />
      <ChatInput />
    </div>
  </div>
</template>
