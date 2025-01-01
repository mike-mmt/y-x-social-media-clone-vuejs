<script setup lang="ts">
import {Feeds} from "../../enums/feeds.enum.ts";
import Post from "../post/Post.vue";
import type {Post as PostType} from "../../models.ts"
import {inject, onMounted, type Ref, ref, watch} from "vue";
import {getFollowingPosts, getForYouPosts, likePost, unlikePost} from "../../services/apiService.ts";

const props = defineProps<{ feed: Feeds; }>();
const posts = ref([] as PostType[]);
const { authToken } = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

async function fetchPosts() {
  if (props.feed === Feeds.ForYou) {
    getForYouPosts(0, authToken.value).then((newPosts) => {
      posts.value = newPosts;
    });
  } else if (props.feed === Feeds.Following) {
    getFollowingPosts(0, authToken.value).then((newPosts) => {
      posts.value = newPosts;
    });
  }
  console.log(posts.value);
}

async function likeOrUnlike(postId: string) {
  const post = posts.value.find((p) => p.id === postId);
  if (post && post.hasLiked.hasLiked > 0) {
    await unlikePost(post.id, authToken.value).then(() => {
      post.hasLiked.hasLiked = 0;
      post.likesCount--;
      // fetchPost(authToken.value);
    });
  } else if (post) {
    await likePost(post!.id, authToken.value).then(() => {
      post.hasLiked.hasLiked = 1;
      post.likesCount++;
      // fetchPost(authToken.value);
    });
  }
}

watch(() => props.feed, async () => {
  fetchPosts();
});

onMounted(() => {
  if (authToken.value !== "") {
    fetchPosts();
  } else {
  watch(authToken, async (newToken: string) => {
    if (newToken) {
      getForYouPosts(0, newToken).then((newPosts) => {
        posts.value = newPosts;
      });
    }
  })
  }
  // getForYouPosts(0, authToken).then((newPosts) => {
  //   console.log(newPosts);
  //   posts.value = newPosts;
  // });
})
</script>

<template>
  <div class="feed">
    <Post v-for="post in posts" :post="post" :key="post.id" @like-or-unlike="likeOrUnlike"/>
  </div>
</template>

<style scoped>
.feed {
  width: 100%;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #747bff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>