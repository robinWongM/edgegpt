<script setup lang="ts">
const { $client } = useNuxtApp();

useHead({
  bodyAttrs: {
    "data-theme": "winter",
  },
});

const input = ref("");
const rawMessages = ref<any[]>([]);

const isStarted = ref(false);
const isLoading = ref(false);

const conversation = reactive({
  conversationId: "",
  conversationSignature: "",
  clientId: "",
  invocationId: "0",
});

const cookies = ref('');

const send = async () => {
  isLoading.value = true;

  if (!isStarted.value) {
    const data = await $client.start.mutate({ cookies: cookies.value });

    conversation.conversationId = data.conversationId;
    conversation.conversationSignature = data.conversationSignature;
    conversation.clientId = data.clientId;
    conversation.invocationId = "0";

    isStarted.value = true;
  } else {
    conversation.invocationId = `${parseInt(conversation.invocationId) + 1}`;
  }

  $client.chat.subscribe(
    { message: input.value, conversation },
    {
      onData: (data: any) => {
        rawMessages.value.push(data);
        conversation.invocationId = data.invocationId;
      },
      onComplete: () => {
        isLoading.value = false;
      },
      onStopped: () => {
        isLoading.value = false;
      },
    }
  );
};
</script>

<template>
  <div class="h-full flex flex-col gap-4 bg-base-100">
    <div class="flex-1 overflow-y-auto">
      <Messages :messages="rawMessages" />
    </div>
    <div class="whitespace-pre-wrap">
      {{ JSON.stringify(conversation) }}
    </div>
    <form>
      <input
        class="input input-bordered"
        v-model="cookies"
        placeholder="Cookies (`_U`) value"
      />
    </form>
    <form class="flex gap-4 bg-base-200 p-4">
      <input class="flex-1 input input-bordered" v-model="input" />
      <button type="submit" class="btn" @click="send" :disabled="isLoading">
        Send
      </button>
    </form>
  </div>
</template>

<style>
html,
body,
#__nuxt {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
