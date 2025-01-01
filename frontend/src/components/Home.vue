<script setup lang="ts">

import FeedSwitcher from "./home/FeedSwitcher.vue";
import Feed from "./home/Feed.vue";
import {Feeds} from "../enums/feeds.enum.ts";
import {inject, type Ref} from "vue";
import WritePost from "./home/WritePost.vue";

const {feed, switchFeed} = inject("feed") as {feed: Ref<Feeds>, switchFeed: (newFeed: Feeds) => void};
</script>

<template>

    <div class="main">
      <FeedSwitcher class="feed-switcher" @switch-feed="switchFeed" :feed="feed"/>
      <WritePost/>
      <Feed :feed="feed"/>
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
  border-left: 1px solid $color-border;
  padding-left: 2rem;
  margin-left: 2rem;
  > * {
    width: 100%
  }
  > *:not(:last-child) {
    border-bottom: 1px solid $color-secondary;
  }
}

Sidebar {
  flex-shrink: 1;
}
</style>