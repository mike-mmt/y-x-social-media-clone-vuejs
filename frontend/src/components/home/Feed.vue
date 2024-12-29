<script setup lang="ts">
import type {Feeds} from "../../enums/feeds.enum.ts";
import Post from "./Post.vue";
import type {Post as PostType, User} from "../../models.ts"
import {reactive} from "vue";
defineProps<{ feed: Feeds; }>();
const post: PostType = reactive({
  id: "abc1",
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  author: {
    username: "reinerbraun",
    displayName: "Reiner Braun",
    dateCreated: new Date(new Date().setFullYear(2024, 11, 20)),
  } as User,
  datePosted: new Date(),
  likesCount: 0,
  repliesCount: 0,
  liked: false,
} as PostType);
</script>

<template>
  <div class="feed">
    <Post :post="post"/>
  </div>
</template>

<style scoped>
.feed {
  width: 100%;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #747bff;
}
</style>