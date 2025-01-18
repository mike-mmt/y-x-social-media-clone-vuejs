<script setup lang="ts">
import ProfileIcon from "../post/ProfileIcon.vue";
import {ref} from "vue";

defineProps<{
  replyingTo: string | null;
}>()
const isFocused = ref(false);
const replyBody = ref("");
const media = ref("");
const showMedia = ref(false);


const emit = defineEmits(['post-reply']);

function onClickReply() {
  emit('post-reply', replyBody.value, media.value);
  replyBody.value = "";
  media.value = "";
}
</script>

<template>
  <div class="write-reply">
    <p class="replying-to" v-if="replyingTo && isFocused">Replying to: <span class="replying-to-username">@{{
        replyingTo
      }}</span></p>
    <div class="center">
      <ProfileIcon/>
      <div class="body-media">
      <textarea v-model="replyBody" class="reply-text" placeholder="Post your reply" @blur="isFocused = false"
                @focus="() => {isFocused = true; showMedia = true;}"></textarea>
      <input v-model="media" v-if="showMedia" :class="{ 'has-content': media.length > 0 }" class="post-p post-media"
             placeholder="link..."
             type="url"
             @blur="isFocused = false"
             @focus="isFocused = true">

      </div>
      <button class="reply-button" @click="onClickReply">Reply</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.write-reply {
  margin-left: 1rem;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
}

.center {
  display: flex;
  gap: 1rem;
}

.replying-to {
  color: $color-text;
}
.replying-to-username {
  color: $color-green;
}
.reply-text {
  border-radius: 0.5rem;
  border: none;
  width: 100%;
  height: 4rem;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
  padding: 0.5rem;
  background-color: $color-secondary;
  color: $color-text;

  &:focus {
    outline: none !important;
    border: 1px solid $color-green;
    //box-shadow: 0 0 10px #719ECE;
  }
}

.reply-button {
  justify-self: flex-end;
  align-self: flex-end;
  margin: 0 1rem 1rem 0;
  background-color: transparent;
  color: $color-text;
  border: 2px solid $color-green;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 300ms;

  &:hover {
    cursor: pointer;
    background-color: $color-green;

  }

  &:active {
    transform: scale(0.95);
  }
}
.body-media {
  flex: 1;
  transition-property: all;
  transition-duration: 500ms;
  transition-timing-function: ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.post-media {
  background-color: $color-secondary;
  color: $color-text;
  padding: 0.5rem;
  border-radius: 0.25rem;
  width: 100%;
  transition-property: all;
  transition-duration: 300ms;
  outline: none;
  border: 1px solid transparent;
  &:focus {
    outline: none;
    border: 1px solid $color-green;
  }
  //&:focus {
  //  width: 100%;
  //}
  //&.has-content {
  //  width: 100%;
  //}
}
</style>