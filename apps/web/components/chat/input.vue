<script setup lang="ts">
const chatId = inject<Ref<string>>("chatId");

const { status, send } = useChat(chatId!);

const input = ref("");
const onSendClick = () => {
  if (chatId?.value === '') {
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
  <form class="flex gap-4 p-4 lg:pl-2">
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
</template>