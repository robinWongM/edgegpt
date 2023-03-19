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
  <div class="h-full flex flex-col bg-base-100">
    <TopBar />
    <ChatMessages />
    <ChatInput />
  </div>
</template>
