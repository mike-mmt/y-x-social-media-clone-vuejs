<script setup lang="ts">
import Logo from "./home/Logo.vue";
import ProfileIcon from "./post/ProfileIcon.vue";
</script>

<template>
  <div class="sidebar">
    <Logo />
    <div class="me" @click="$router.push('/me')">
      <ProfileIcon />
      <p class="me-profile">My Profile</p>
    </div>
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
}
.me {
  background-color: $color-secondary;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  margin-left: 1rem;
  border-radius: 0.25rem;
  .me-profile {
    color: $color-text;
  }
  &:hover {
    cursor: pointer;
    background-color: $color-darkgray;
  }
}
</style>