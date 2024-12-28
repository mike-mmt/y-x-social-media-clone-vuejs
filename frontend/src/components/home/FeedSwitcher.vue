<script setup lang="ts">

import {Feeds} from "../../enums/feeds.enum.ts";

defineProps<{feed: Feeds}>()
</script>

<template>
  <div class="feed-switcher">
    <button class="switch-btn" :class="{active: feed === Feeds.ForYou}" :disabled="feed === Feeds.ForYou"
            @click="$emit('switchFeed', Feeds.ForYou)">For You</button>
    <button class="switch-btn" :class="{active: feed === Feeds.Following}" :disabled="feed === Feeds.Following"
            @click="$emit('switchFeed', Feeds.Following)">Following</button>
  </div>
</template>

<style scoped lang="scss">
.feed-switcher {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0.5rem;
  gap: 2rem;
}
.switch-btn {
  flex: 1;
  background-color: transparent;
  color: $color-text;
  padding: 0.5rem 1rem;
  border: none;
  border-bottom: 3px solid $color-text;
  transition: all 300ms;

  &.active {
    color: $color-green;
    border-bottom: 3px solid $color-green;
  }
  &:hover {
    cursor: pointer;
  }
  &:active {
    transform: translateY(2px);
  }
}

</style>