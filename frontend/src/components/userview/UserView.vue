<script setup lang="ts">

import {inject, type Ref} from "vue";
import type {User} from "../../models.ts";
import ProfileIcon from "../post/ProfileIcon.vue";

const user = inject("user") as Ref<User | null>;
// TODO
</script>

<template>
  <div class="user-view">
    <div v-if="user">
      <ProfileIcon/>
      <div class="names">
        <h3 class="display-name">{{ user.displayName }}</h3>
        <p class="username">@{{ user.username }}</p>
      </div>
    </div>
    <div v-if="user" class="lists">
      <div class="list followers">
        <p>{{ user.followersCount }} Followers</p>
<!--        <div v-for="..."></div>-->
      </div>
      <div class="list following">
        <p>{{ user.followingCount }} Following</p>
      </div>
      <div class="list muted">
        <p>Muted</p>
      </div>
      <div class="list blocked">
        <p>Blocked</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.names {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.username {
  color: $color-less-important;
}
</style>