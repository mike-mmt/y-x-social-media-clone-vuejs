<script setup lang="ts">
import {nextTick, ref} from "vue";
import {fetchImage} from "../../services/fetchImage.ts";
const props = defineProps<{ url: string }>()

const mediaIsImage = ref(false);
const imageLoaded = ref(false);

if (props.url) {
  fetchImage(props.url).then((res) => {
    // mediaIsImage.value = isValid(props.post.media);
    if (res) {
      mediaIsImage.value = true;
      // console.log(image.value)
      nextTick(() => {
        imageLoaded.value = true;
      })
    } else {
      // console.log("no image")
    }
  });
}
</script>

<template>
  <img v-if="mediaIsImage" class="media image"  :src="url" alt="image" :class="{ 'image-loaded': imageLoaded }"/>
  <p class="media link" v-else >{{ url }}</p>
</template>

<style scoped lang="scss">
.media {
  margin-top: 1rem;
  color: $color-text;
  &.link {
    background-color: $color-tertiary;
    padding: 0.5rem;
    border-radius: 0.25rem;
    text-decoration: underline;
    &:hover {
      cursor: pointer;
    }
  }
  &.image {
    max-height: 18rem;
    border-radius: 0.25rem;
    opacity: 0;
    transform: scaleY(0);
    transition: opacity 3s, transform 3s;
    &.image-loaded {
      opacity: 1;
      transform: scaleY(1);
    }
  }
}
</style>