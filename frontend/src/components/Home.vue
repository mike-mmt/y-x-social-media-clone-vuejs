<script setup lang="ts">

import FeedSwitcher from "./home/FeedSwitcher.vue";
import Feed from "./home/Feed.vue";
import {Feeds} from "../enums/feeds.enum.ts";
import {inject, ref, type Ref} from "vue";
import WritePost from "./home/WritePost.vue";
import {createPost} from "../services/apiService.ts";

const {feed, switchFeed} = inject("feed") as {feed: Ref<Feeds>, switchFeed: (newFeed: Feeds) => void};
const { authToken } = inject('authToken') as { authToken: Ref<string> }
const feedRef = ref()

async function writePost(body: string, media: string) {
  const post = await createPost(body, media, "", authToken.value)
  console.log(post)
  if (feed.value === Feeds.MyPosts) {
    feedRef.value.addUserPost(post)
  } else {
    switchFeed(Feeds.MyPosts)
  }
  // feedRef.value.addUserPost(post)
}
</script>

<template>

    <div class="main">
      <FeedSwitcher class="feed-switcher" @switch-feed="switchFeed" :feed="feed"/>
      <WritePost @write-post="writePost"/>
      <Feed :feed="feed" ref="feedRef"/>
    </div>

</template>

<style scoped lang="scss">
.home {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60%;
  min-width: fit-content;
  > * {
    width: 100%
  }
  //> *:not(:last-child) {
  //  border-bottom: 1px solid $color-secondary;
  //}
}

Sidebar {
  flex-shrink: 1;
}
</style>