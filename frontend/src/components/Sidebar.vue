<script setup lang="ts">
import Logo from "./home/Logo.vue";
import ProfileIcon from "./post/ProfileIcon.vue";
import {inject, type Ref} from "vue";
import type {User} from "../models.ts";
const user = inject("user") as Ref<User | null>;

const props = defineProps<{ logout: () => void }>();

</script>


<template>
  <div class="sidebar">
    <Logo />
    <RouterLink style="text-decoration: none" to="/me">
      <div v-if="user" class="me" @click="$router.push('/me')">
        <ProfileIcon />
        <p  class="me-profile">{{user.displayName}}</p>
      </div>
    </RouterLink>
    <div v-if="user" class="logout" @click="props.logout">Log out</div>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $color-secondary;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid $color-border;
  padding-right: 1rem;
  margin-right: 2rem;
  min-width: 15%;
}
.me {
  background-color: $color-secondary;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  margin-left: 1rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  .me-profile {
    color: $color-text;
  }
  &:hover {
    cursor: pointer;
    border: 1px solid $color-green;
    background-color: $color-darkgray;
  }
}
.logout {
  color: $color-less-important;
  padding: 1rem 2rem;
  margin-top: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  &:hover {
    cursor: pointer;
    border-color: $color-text;
    color: $color-text;
    background-color: $color-darkgray;

  }
}
</style>