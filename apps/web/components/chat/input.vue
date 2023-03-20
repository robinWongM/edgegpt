<script setup lang="ts">
import { useTextareaAutosize } from "@vueuse/core";
import FluentSend16Regular from '~icons/fluent/send-16-regular'

const chatId = inject<Ref<string>>("chatId");
const { status, send } = useChat(chatId!);

const { textarea, input } = useTextareaAutosize();

const onSendClick = () => {
  if (chatId?.value === "") {
    const newChatId = crypto.randomUUID();
    const { send: newSend } = useChat(newChatId);

    newSend(input.value);
    input.value = "";
    return navigateTo(`/chat/${newChatId}`);
  }

  send(input.value);
  input.value = "";
};
</script>

<template>
  <form class="flex gap-4 p-8 items-center relative w-50% mx-auto transition-all focus-within:w-full">
    <textarea
      ref="textarea"
      class="flex-1 textarea resize-none overflow-hidden shadow-lg min-h-12 transition duration-300 hover:shadow-xl outline-none active:outline-none focus:outline-none"
      v-model="input"
      placeholder="Ask..."
    />
    <button
      type="submit"
      class="btn btn-circle btn-sm btn-ghost absolute right-10 bottom-10"
      @click="onSendClick"
      :disabled="!status.canSend"
    >
      <FluentSend16Regular />
    </button>
  </form>
</template>
