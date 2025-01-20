<script setup lang="ts">
import type {Post} from "../../models.ts";
import {inject, type Ref, ref} from "vue";
import MuteButton from "./MuteButton.vue";
import {muteUser, unmuteUser} from "../../services/apiService.ts";

const props = defineProps<{ post: Post }>()
const emit = defineEmits(['reloadReplies']);
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

const isHovered = ref(false);

function onMouseEnter() {
  isHovered.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
}

async function muteOrUnmute() {
    if (props.post.isMuted > 0) {
      if (await unmuteUser(props.post.authorUsername, authToken.value)) {
        props.post.isMuted = 0;
        emit('reloadReplies');
      }
    } else {
      if (await muteUser(props.post.authorUsername, authToken.value)) {
        props.post.isMuted = 1;
        emit('reloadReplies');
      }
    }
}
</script>

<template>
<div class="post" v-if="post">
<div class="post-header-info" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
  <svg class="li-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/></svg>
  <p class="username">{{ post.authorDisplayName }}</p>
  <p class="username">@{{ post.authorUsername }}</p>
  <p class="lessimportant">...</p>
  <MuteButton v-if="isHovered" class="mute-block-btn" :is-muted="post.isMuted" @mute-or-unmute="muteOrUnmute"/>
</div>
</div>
</template>

<style scoped lang="scss">
.post {
  background-color: $color-secondary;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  //padding: 1rem;
  border: 1px solid #747bff;
  border-radius: 0.5rem;
}
.post-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem;
  .username {
    color: $color-less-important;
  }

}
.lessimportant {
  color: $color-less-important;
}
.li-svg {
  fill: $color-less-important;
}
</style>