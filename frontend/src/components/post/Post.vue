<script setup lang="ts">
import type {Post} from "../../models.ts";
import LikeIcon from "./LikeIcon.vue";
import ReplyIcon from "./ReplyIcon.vue";
import {computed} from "vue";
import ProfileIcon from "./ProfileIcon.vue";

const props = defineProps<{ post: Post, isReply?: boolean }>()

function likeOrUnlike() {
  props.post.liked = !props.post.liked;
  if (props.post.liked) {
    // props.post.likesCount++;
  } else {
    // props.post.likesCount--;
  }
}
const date = computed(() => {
  return props.post.datePosted.toLocaleString('pl-PL');
})
</script>

<template>
  <div class="post">
    <div class="repliedTo" v-if="post.parent && !isReply" >
      ...
    </div>
    <div class="actual-post" @click="$router.push(`/${post.id}`)">
    <div class="post-avatar">
      <ProfileIcon/>
    </div>
    <div class="main-container">
      <div class="post-header-info">
        <h3 class="display-name">{{ post.authorDisplayName }}</h3>
        <p class="username">@{{ post.authorUsername }}</p>
        <p class="date">• {{ date }}</p>
      </div>
      <div class="post-content">
        <p class="body">{{ post.body }}</p>
      </div>
      <div class="post-footer">
        <LikeIcon :liked="post.liked" @like-or-unlike="likeOrUnlike"/>
        <p class="likes-count">{{ post.likesCount }}</p>
        <ReplyIcon/>
        <p class="replies-count">{{ post.repliesCount }}</p>
    </div>
    </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.post {
  &:hover {
    cursor: pointer;
  }
  display: flex;
  flex-direction: column;
  //padding: 1rem;
  border: 1px solid #747bff;
  border-radius: 0.5rem;
  //gap: 1rem;
  .actual-post {
    display: flex;
    padding: 1rem;
    gap: 0.5rem;
  }
  .repliedTo {
    padding: 0.5rem;
    border-bottom: 1px solid #747bff;
    //border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .main-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .post-header-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      .username {
        color: $color-less-important;
      }
      .date {
        color: $color-less-important;
      }
    }
  }
  .post-footer {
    margin-top: 0.5rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    :nth-child(2) {
      margin-right: 1rem;
    }
  }

}
</style>