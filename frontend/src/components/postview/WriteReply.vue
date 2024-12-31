<script setup lang="ts">
import ProfileIcon from "../post/ProfileIcon.vue";
import {ref} from "vue";

const props = defineProps<{
  replyingTo: string | null;
}>()
const isFocused = ref(false);
const replyBody = ref("");

const emit = defineEmits(['post-reply']);

function onClickReply() {
  emit('post-reply', replyBody.value);
  replyBody.value = "";
}
</script>

<template>
  <div class="write-reply">
    <p class="replying-to" v-if="replyingTo && isFocused">Replying to: <span class="replying-to-username">@{{
        replyingTo
      }}</span></p>
    <div class="center">
      <ProfileIcon/>
      <textarea v-model="replyBody" class="reply-text" placeholder="Post your reply" @focus="isFocused = true"
                @blur="isFocused = false"></textarea>
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
  color: $color-green;
}

.reply-text {
  border-radius: 0.5rem;
  border: none;
  width: 100%;
  height: 4rem;
  margin: 1rem 0;
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
</style>