<script setup lang="ts">
import {computed, ref} from "vue";
import type {User} from "../../models.ts";

const props = defineProps<{ isMuted: number, user?: User }>()
const isHovered = ref(false);

const btnText = computed(() => {
  return props.isMuted ? (isHovered.value ? "Unmute" : "Muted") : "Mute";
})

function onMouseEnter() {
  isHovered.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
}
</script>

<template>
<button :class="{ mute: !isMuted, unmute: isMuted }" class="btn"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click.stop="$emit('mute-or-unmute', props.user)">
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
.mute {
  background-color: $color-darkgray;
  color: $color-text;
  &:hover {
    border: 1px solid $color-text;
  }
  &:active {
    transform: translateY(2px);
  }
}
.unmute {
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