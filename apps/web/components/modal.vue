<script setup lang="ts">
defineProps<{
  id: string;
  title: string;
}>();
</script>

<template>
  <Teleport to="body">
    <input type="checkbox" :id="$props.id" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-xl">
        <h3 class="font-bold text-xl">{{ $props.title }}</h3>
        <slot />
        <div class="modal-action">
          <slot name="action" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
