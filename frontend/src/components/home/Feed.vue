<script setup lang="ts">
import {Feeds} from "../../enums/feeds.enum.ts";
import Post from "../post/Post.vue";
import type {Post as PostType} from "../../models.ts"
import {inject, onMounted, onUnmounted, type Ref, ref, watch} from "vue";
import {getFollowingPosts, getForYouPosts, getMyPosts, likePost, unlikePost} from "../../services/apiService.ts";
import { gsap } from "gsap";

const props = defineProps<{ feed: Feeds; }>();
const posts = ref([] as PostType[]);
const page = ref(0);
const loading = ref(true);
const locked = ref(false);
const { authToken } = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

async function lock() {
  locked.value = true;
  setTimeout(() => {
    locked.value = false;
  }, 2000);
}

async function fetchPosts() {
  loading.value = true;
  lock()
  if (props.feed === Feeds.ForYou) {
    getForYouPosts(0, authToken.value).then((newPosts) => {
      posts.value = newPosts;
      loading.value = false;
    });
  } else if (props.feed === Feeds.Following) {
    getFollowingPosts(0, authToken.value).then((newPosts) => {
      posts.value = newPosts;
      loading.value = false;
    });
  } else if (props.feed === Feeds.MyPosts) {
    getMyPosts(0, authToken.value).then((newPosts) => {
      posts.value = newPosts;
      loading.value = false;
    });
  }
  console.log(posts.value);
}

async function fetchMorePosts() {
  if (loading.value) return;
  loading.value = true;
  lock()
  if (props.feed === Feeds.ForYou) {
    getForYouPosts(page.value, authToken.value).then((newPosts) => {
      posts.value = posts.value.concat(newPosts);
      if (newPosts.length === 0) {
        page.value--;
      }
      loading.value = false;
    });
  } else if (props.feed === Feeds.Following) {
    getFollowingPosts(page.value, authToken.value).then((newPosts) => {
      posts.value = posts.value.concat(newPosts);
      if (newPosts.length === 0) {
        page.value--;
      }
      loading.value = false;
    });
  } else if (props.feed === Feeds.MyPosts) {
    getMyPosts(page.value, authToken.value).then((newPosts) => {
      posts.value = posts.value.concat(newPosts);
      if (newPosts.length === 0) {
        page.value--;
      }
      loading.value = false;
    });
  }
  console.log(posts.value);
}

async function likeOrUnlike(postId: string) {
  const post = posts.value.find((p) => p.id === postId);
  if (post && post.hasLiked > 0) {
    await unlikePost(post.id, authToken.value).then(() => {
      post.hasLiked = 0;
      post.likesCount--;
      // fetchPost(authToken.value);
    });
  } else if (post) {
    await likePost(post!.id, authToken.value).then(() => {
      post.hasLiked = 1;
      post.likesCount++;
      // fetchPost(authToken.value);
    });
  }
}

function handleScroll() {
  if (window.innerHeight + window.scrollY + 1 >= document.body.offsetHeight && posts.value.length > 0) {
    console.log(loading.value)
    console.log(locked.value)
    if (!loading.value && !locked.value) {
      page.value++;
      fetchMorePosts();
    }
  }
}

watch(() => props.feed, async () => {
  posts.value = [];
  fetchPosts();
});

onMounted(() => {
  if (authToken.value !== "") {
    fetchPosts();
  } else {
  watch(authToken, async (newToken: string) => {
    if (newToken) {
      fetchPosts();
    }
  })
  }
  window.addEventListener('scroll', handleScroll);
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
})
// for list animation
function onEnter(el: any, done: any) {
  gsap.to(el, {
    opacity: 1,
    height: "auto",
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}
function beforeEnter(el: any) {
  gsap.set(el, { opacity: 0, height: 0 })
}
function addUserPost(post: PostType) {
  console.log(post);
  posts.value.unshift(post);
}
defineExpose({
  addUserPost
})
</script>

<template>
  <div class="feed">
    <TransitionGroup name="feed-list" :css="false"  @before-enter="beforeEnter" @enter="onEnter" @leave="">
      <Post v-for="(post, index) in posts" :post="post" :key="post.id" class="feed-item" @like-or-unlike="likeOrUnlike" :data-index="index"/>
    </TransitionGroup>
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