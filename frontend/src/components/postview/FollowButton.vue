<script setup lang="ts">
import {computed, ref} from "vue";
import type {User} from "../../models.ts";

const props = defineProps<{ isFollowing: number, user?: User }>()
const isHovered = ref(false);

const btnText = computed(() => {
  return props.isFollowing ? (isHovered.value ? "Unfollow" : "Following") : "Follow";
})

function onMouseEnter() {
  isHovered.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
}
</script>

<template>
<button :class="{ follow: !isFollowing, unfollow: isFollowing }" class="btn"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click.stop="$emit('follow-or-unfollow', props.user)">
  {{ btnText}}
</button>
</template>

<style scoped lang="scss">
.btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: $color-secondary;
  color: $color-text;
  &:hover {
    cursor: pointer;
  }
  transition: background-color 0.3s;
}
.follow {
  background-color: $color-green;
  color: $color-text;
  &:hover {
    border: 1px solid $color-text;
  }
  &:active {
    transform: translateY(2px);
  }
}
.unfollow {
  background-color: $color-secondary;
  border: 1px solid $color-green;
  color: $color-text;
  &:hover {
    background-color: #e31c4e;
    border: none;
  }
  &:active {
    transform: translateY(2px);
  }
}
</style>