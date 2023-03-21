<script setup lang="ts">
import { useTextareaAutosize } from "@vueuse/core";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const { textarea, input } = useTextareaAutosize({
  input: props.modelValue,
});

watch(input, (value) => {
  emit("update:modelValue", value);
});
watch(
  () => props.modelValue,
  (value) => {
    input.value = value;
  }
);
</script>

<template>
  <textarea
    class="textarea w-full mt-4 max-h-36 resize-none"
    ref="textarea"
    v-model="input"
    placeholder="WebPage context (optional)"
  />
</template>
