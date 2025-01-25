<script setup lang="ts">
import type {Socket} from "socket.io-client";
import {inject, ref, type Ref, watch} from "vue";
import type {User, NotificationType, Post} from "../../models.ts";
import {useRouter} from "vue-router";

const router = useRouter();
const socket = inject("socket") as Socket;
const me = inject("user") as Ref<User | null>;

const notifications = ref<NotificationType[]>([]);

watch(me, (newMe) => {
  if (newMe) {
    socket.on(`notification:${newMe.username}`, (notification) => {
      console.log(notification);
      switch (notification.type) {
        case "yourPostReply":
          const post = notification.post as Post;
          const truncated = post.body.length > 20;
          const newNotification: NotificationType = {
            type: notification.type,
            timestamp: new Date(),
            description: `New reply to your post`,
            content: post.body.substring(0, Math.min(20, post.body.length)) + (truncated ? "..." : ""),
            link: `/post/${notification.post.id}`,
          };
          notifications.value.unshift(newNotification);
      }
    });
  }
}, {immediate: true});

// TODO: display list on hover, add styles
</script>

<template>
  <div class="notifications" v-if="me">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#ffffff">
      <path
          d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/>
    </svg>
    <div class="notifications-list">
      <div v-for="notification in notifications" class="notification-list">
        <div @click="router.push(notification.link)" class="notification-description">
          <p>{{ notification.description }}</p>
          <p v-if="notification.content">{{ notification.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon {
  fill: $color-text;
}

</style>