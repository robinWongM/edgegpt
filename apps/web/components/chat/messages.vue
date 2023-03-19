<script setup lang="ts">
import FluentPerson24Filled from "~icons/fluent/person-24-filled";
import FluentBot24Regular from "~icons/fluent/bot-24-regular";

const chatId = inject<Ref<string>>("chatId");
const { messages, status, send } = useChat(chatId!);

const messageContainer = ref<HTMLElement | null>(null);

const shouldStickToBottom = ref(true);
const updateShouldStickToBottom = () => {
  const { scrollHeight, clientHeight, scrollTop } = messageContainer.value!;
  shouldStickToBottom.value = scrollHeight - clientHeight - scrollTop < 100;
};

const scrollToBottom = () => {
  if (!messageContainer.value) {
    return;
  }

  const { scrollHeight, clientHeight } = messageContainer.value!;
  messageContainer.value!.scrollTop = scrollHeight - clientHeight;
};

watch(
  messages,
  () => {
    if (!shouldStickToBottom.value) {
      return;
    }

    scrollToBottom();
  },
  { flush: "post", immediate: true }
);
</script>

<template>
  <div
    class="flex-1 overflow-y-auto"
    ref="messageContainer"
    @scroll="updateShouldStickToBottom"
  >
    <div>
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex gap-4 px-6 pt-4 pb-8"
        :class="
          message.author === 'user'
            ? 'bg-base-300 text-base-content'
            : message.author === 'system'
            ? 'bg-error text-error-content'
            : ''
        "
      >
        <span class="mt-3">
          <FluentPerson24Filled
            v-if="message.author === 'user'"
            class="w-6 h-6"
          />
          <FluentBot24Regular v-else class="w-6 h-6" />
        </span>
        <div class="flex-1">
          <Markdown class="pt-1" :content="message.text" />
          <div
            v-if="message.suggestions"
            class="flex flex-wrap gap-x-4 gap-y-2 mt-4"
          >
            <button
              class="btn py-2 min-h-auto h-auto leading-4 flex-1 lg:flex-none"
              v-for="suggestion in message.suggestions"
              :key="suggestion"
              @click="send(suggestion)"
              :disabled="!status.canSend"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
