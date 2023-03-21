<script setup lang="ts">
import FluentPerson24Filled from "~icons/fluent/person-24-filled";
import FluentBot24Regular from "~icons/fluent/bot-24-regular";

const chatId = inject<Ref<string>>("chatId");
const { messages, status, send } = useChat(chatId!);
</script>

<template>
  <div
    class="flex-1 overflow-y-auto"
  >
    <div>
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex gap-4 px-6 py-4"
        :class="
          message.author === 'user'
            ? ''
            : message.author === 'system'
            ? 'bg-warning text-warning-content'
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
        <div class="flex-1 overflow-x-hidden">
          <Markdown class="pt-1 w-full" :content="message.text" />
          <div
            v-if="message.suggestions"
            class="flex flex-wrap gap-x-4 gap-y-2 mt-4"
          >
            <button
              class="btn btn-ghost py-2 min-h-auto h-auto leading-4 flex-1 lg:flex-none"
              :class="status.canSend ? 'btn-outline' : ''"
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
