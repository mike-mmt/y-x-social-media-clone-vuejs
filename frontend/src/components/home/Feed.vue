<script setup lang="ts">
import type {Feeds} from "../../enums/feeds.enum.ts";
import Post from "./Post.vue";
import type {Post as PostType, User} from "../../models.ts"
import {inject, onMounted, reactive, type Ref, ref, watch} from "vue";
import {getForYouPosts} from "../../services/apiService.ts";
defineProps<{ feed: Feeds; }>();
// const post: PostType = reactive({
//   id: "abc1",
//   body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
//   author: {
//     username: "reinerbraun",
//     displayName: "Reiner Braun",
//     dateCreated: new Date(new Date().setFullYear(2024, 11, 20)),
//   } as User,
//   datePosted: new Date(),
//   likesCount: 0,
//   repliesCount: 0,
//   liked: false,
// } as PostType);

const posts = ref([] as PostType[]);
const { authToken } = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

onMounted(() => {
  if (authToken.value !== "") {
    getForYouPosts(0, authToken.value).then((newPosts) => {
      console.log(newPosts);
      posts.value = newPosts;
    });
  } else {
  watch(authToken, async (newToken: string) => {
    if (newToken) {
      getForYouPosts(0, newToken).then((newPosts) => {
        console.log(newPosts);
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
    <Post v-for="post in posts" :post="post" :key="post.id" />
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