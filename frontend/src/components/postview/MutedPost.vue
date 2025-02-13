<script setup lang="ts">
import type {Post} from "../../models.ts";
import {inject, type Ref, ref} from "vue";
import MuteButton from "./MuteButton.vue";
import {muteUser, unmuteUser} from "../../services/apiService.ts";
import {useHover} from "../../hooks/useHover.ts";
import MutedIcon from "./MutedIcon.vue";

const props = defineProps<{ post: Post }>()
const emit = defineEmits(['reloadReplies']);
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

const { isHovered, bind } = useHover();
const {onMouseEnter, onMouseLeave} = bind;

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
<div class="post" v-if="post" @click.stop="$router.push(`/post/${post.id}`)">
<div class="post-header-info" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
  <MutedIcon/>
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
</style>