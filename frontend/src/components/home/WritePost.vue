<script setup lang="ts">

</script>

<template>
  <div class="write-post">
    <textarea class="post-body" placeholder="What's on your mind?"></textarea>
    <button class="post-btn">Post</button>
  </div>
</template>

<style scoped lang="scss">
.write-post {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 50%;
}
.post-body {
  background-color: $color-tertiary;
  color: $color-text;
  flex: 1;
  padding: 0.5rem;
}
.post-btn {
  background-color: $color-quaternary;
  color: $color-text;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0.5rem 1rem;
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