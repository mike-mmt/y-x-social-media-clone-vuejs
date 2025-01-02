<script setup lang="ts">
import {computed, ref} from "vue";

const props = defineProps<{ isBlocked: number }>()
const isHovered = ref(false);

const btnText = computed(() => {
  return props.isBlocked ? (isHovered.value ? "Unblock" : "Blocked") : "Block";
})

function onMouseEnter() {
  isHovered.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
}
</script>

<template>
<button :class="{ block: !isBlocked, unblock: isBlocked }" class="btn"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click.stop="$emit('block-or-unblock')">
  {{ btnText}}
</button>
</template>

<style scoped lang="scss">
.btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: $color-darkgray;
  color: $color-text;
  &:hover {
    cursor: pointer;
  }
  transition: background-color 0.3s;
}
.block {
  background-color: $color-darkgray;
  color: $color-text;
  &:hover {
    border: 1px solid $color-text;
  }
  &:active {
    transform: translateY(2px);
  }
}
.unblock {
  background-color: $color-darkgray;
  border: 1px solid #e31c4e;
  color: $color-text;
  &:hover {
    background-color: $color-darkgray;
    border: 1px solid $color-text;
  }
  &:active {
    transform: translateY(2px);
  }
}
</style>