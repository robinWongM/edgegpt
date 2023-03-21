<script setup lang="ts">
const chatId = inject<Ref<string>>("chatId");
const { metadata } = useChat(chatId!);

const toneOptions = {
  creative: "Creative",
  balanced: "Balanced",
  precise: "Precise",
} as const;
</script>

<template>
  <div class="btn-group flex">
    <button
      v-for="(label, tone) in toneOptions"
      class="btn btn-sm flex-1"
      :class="{ 'btn-active': metadata.tone === tone }"
      @click="metadata.tone = tone"
    >
      {{ label }}
    </button>
  </div>
</template>
