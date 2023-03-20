<script setup lang="ts">
const props = defineProps<{
  chatId: string;
}>();

provide(
  "chatId",
  computed(() => props.chatId)
);
</script>

<template>
  <div class="h-full flex flex-col bg-gradient-linear from-opacity-30 to-opacity-30  from-sky-100 to-blue-300">
    <TopBar />
    <ChatMessages />
    <ChatInput />
  </div>
</template>
