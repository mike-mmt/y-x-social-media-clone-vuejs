<script setup lang="ts">
import type {Post} from "../../models.ts";
import {inject, type Ref, ref} from "vue";
import BlockButton from "./BlockButton.vue";
import {blockUser, unblockUser} from "../../services/apiService.ts";
import {useHover} from "../../hooks/useHover.ts";
import BlockedIcon from "./BlockedIcon.vue";

const props = defineProps<{ post: Post }>()
const emit = defineEmits(['reloadReplies']);
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

const { isHovered, bind } = useHover();
const {onMouseEnter, onMouseLeave} = bind;

async function blockOrUnblock() {
    if (props.post.isBlocked > 0) {
      if (await unblockUser(props.post.authorUsername, authToken.value)) {
        props.post.isBlocked = 0;
        emit('reloadReplies');
      }
    } else {
      if (await blockUser(props.post.authorUsername, authToken.value)) {
        props.post.isBlocked = 1;
        emit('reloadReplies');
      }
    }
}
</script>

<template>
<div class="post" v-if="post" @click.stop="$router.push(`/post/${post.id}`)">
<div class="post-header-info" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
  <BlockedIcon/>
  <p class="username">{{ post.authorDisplayName }}</p>
  <p class="username">@{{ post.authorUsername }}</p>
  <p class="lessimportant">...</p>
  <BlockButton v-if="isHovered" class="block-block-btn" :is-blocked="post.isBlocked" @block-or-unblock="blockOrUnblock"/>
</div>
</div>
</template>

<style scoped lang="scss">
.post {
  //background-color: #1D1E20;
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