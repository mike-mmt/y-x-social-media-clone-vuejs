<script setup lang="ts">
import type {Post as PostType} from "../models.ts";
import LikeIcon from "./home/LikeIcon.vue";
import ReplyIcon from "./home/ReplyIcon.vue";
import {inject, onMounted, ref, type Ref, watch} from "vue";
import {useRoute} from "vue-router";
import {getPost} from "../services/apiService.ts";
import Post from "./home/Post.vue";

const post = ref<PostType | null>(null);
const parentPost = ref<PostType | null>(null);
const replies = ref<PostType[]>([]);

const route = useRoute();
// function likeOrUnlike() {
//   props.post.liked = !props.post.liked;
//   if (props.post.liked) {
//     // props.post.likesCount++;
//   } else {
//     // props.post.likesCount--;
//   }
// }
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

async function fetchPost(authToken: string) {
  getPost(route.params.id as string, authToken).then((newPost) => {
    console.log(newPost);
    post.value = newPost;
    if (newPost.parent) {
      getPost(newPost.parent, authToken).then((parent) => {
        parentPost.value = parent;
      });
    }
    // TODO: fetch replies
  });
}

onMounted(async () => {
  if (authToken.value !== "") {
    fetchPost(authToken.value)
  } else {
    watch(authToken, async (newToken: string) => {
      fetchPost(newToken)
    })
  }

})
</script>

<template>
  <div class="post">
    <p class="back-post-btn">← Post</p>
    <div class="repliedTo" v-if="post && post.parent && parentPost">
      <Post :post="parentPost" />
    </div>
    <div class="actual-post">
      <div class="post-avatar">
        <img src="/default-avatar.svg" alt="avatar" class="avatar" width="40"/>
      </div>
      <div class="main-container" v-if="post">
        <div class="post-header-info">
          <h3 class="display-name">{{ post.authorDisplayName }}</h3>
          <p class="username">@{{ post.authorUsername }}</p>
          <p class="date">• {{ post.datePosted.toLocaleString('pl-PL') }}</p>
        </div>
        <div class="post-content">
          <p class="body">{{ post.body }}</p>
        </div>
        <div class="post-footer">
          <!--          <LikeIcon :liked="post.liked" @like-or-unlike=""/>-->
          <p class="likes-count">{{ post.likesCount }}</p>
          <!--          <ReplyIcon/>-->
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
  .back-post-btn {
    margin: 0.5rem;
    color: $color-text;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>