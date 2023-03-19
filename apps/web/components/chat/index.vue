<script setup lang="ts">
const props = defineProps<{
  chatId: string;
}>();

const { messages, status, send } = useChat(computed(() => props.chatId));

const input = ref("");
const onSendClick = () => {
  if (props.chatId === '') {
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
  <div class="h-full flex flex-col bg-base-100">
    <TopBar />
    <Messages :messages="messages" :send="send" />
    <form class="flex gap-4 bg-base-200 p-4 lg:pl-0">
      <input class="flex-1 input input-bordered" v-model="input" />
      <button
        type="submit"
        class="btn btn-primary"
        @click="onSendClick"
        :disabled="!status.canSend"
      >
        Send
      </button>
    </form>
  </div>
</template>
