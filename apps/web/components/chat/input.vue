<script setup lang="ts">
import { useTextareaAutosize } from "@vueuse/core";
import FluentSend16Regular from "~icons/fluent/send-16-regular";

const chatId = inject<Ref<string>>("chatId");
const { metadata, status, send } = useChat(chatId!);

const { textarea, input, triggerResize } = useTextareaAutosize();
const pageContent = ref("");

const resetInput = () => {
  input.value = "";
  nextTick(triggerResize);
};

const onSendClick = () => {
  if (!status.canSend || !input.value?.trim()) {
    return;
  }

  if (chatId?.value === "") {
    const newChatId = crypto.randomUUID();
    const { metadata: newMetadata, send: newSend } = useChat(newChatId);

    newMetadata.title = input.value;
    newMetadata.tone = metadata.tone;
    newSend(input.value, pageContent.value);
    resetInput();
    return navigateTo(`/chat/${newChatId}`);
  }

  send(input.value, pageContent.value);
  resetInput();
};
</script>

<template>
  <div
    class="p-8 mx-auto w-full sticky bottom-0 bg-gradient-linear from-opacity-0 to-opacity-100 via-opacity-100 from-base-200 via-base-200 to-base-200"
  >
    <ChatTone />
    <ChatPageContent v-model="pageContent" />
    <form class="mt-4 flex gap-4 items-center group">
      <textarea
        ref="textarea"
        class="flex-1 textarea border-none resize-none shadow-lg min-h-12 transition duration-300 hover:shadow-xl outline-none max-h-50vw pr-16 peer"
        v-model="input"
        placeholder="Ask..."
        @keypress.enter.exact.prevent="onSendClick"
      />
      <button
        type="submit"
        class="btn btn-sm btn-square absolute right-10 bottom-10 transition-all"
        :class="
          status.canSend
            ? 'btn-primary group-focus-within:w-14'
            : 'disabled:bg-transparent'
        "
        @click.prevent="onSendClick"
        :disabled="!status.canSend"
      >
        <FluentSend16Regular />
      </button>
    </form>
  </div>
</template>
