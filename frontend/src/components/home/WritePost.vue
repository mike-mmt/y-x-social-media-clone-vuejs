<script setup lang="ts">

import ProfileIcon from "../post/ProfileIcon.vue";
import {ref} from "vue";

const body = ref("");
const media = ref("");

const emit = defineEmits(['write-post']);

function onClickPost() {
  emit('write-post', body.value, media.value);
  body.value = "";
  media.value = "";
}

</script>

<template>
  <div class="write-post">
    <ProfileIcon/>
    <div class="body-media">
      <textarea v-model="body" :class="{ 'has-content': body.length > 0 }" class="post-p post-body" placeholder="What's on your mind?"></textarea>
      <input v-model="media" :class="{ 'has-content': media.length > 0 }" class="post-p post-media" type="url" placeholder="link...">
    </div>
    <button class="post-btn" @click="onClickPost">Post</button>
  </div>
</template>

<style scoped lang="scss">
.write-post {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 80%;
}

.body-media {
  width: 40%;
  &:has(> .has-content) {
    width: 100%;
  }
  &:has(> .post-p:focus) {
    width: 100%;

  }
  transition-property: all;
  transition-duration: 500ms;
  transition-timing-function: ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}
.post-body {
  background-color: $color-tertiary;
  color: $color-text;
  flex: 1;
  padding: 0.5rem;
  border: none;
  outline: none;
  border-radius: 0.25rem;
  transition-property: all;
  transition-duration: 300ms;
  width: 100%;
  //&:focus {
  //  width: 100%;
  //  }
  //&.has-content {
  //  width: 100%;
  //}
}
.post-media {
  background-color: $color-tertiary;
  color: $color-text;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  width: 100%;
  transition-property: all;
  transition-duration: 300ms;
  //&:focus {
  //  width: 100%;
  //}
  //&.has-content {
  //  width: 100%;
  //}
}

.post-btn {
  background-color: $color-quaternary;
  color: $color-text;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 300ms;

  &:hover {
    cursor: pointer;
  }

  &:active {
    transform: scale(0.95);
    background-color: $color-green;
  }
}
</style>