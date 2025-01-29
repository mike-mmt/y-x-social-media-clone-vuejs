<script setup lang="ts">
import type {Socket} from "socket.io-client";
import {inject, ref, type Ref, watch} from "vue";
import type {User, NotificationType, Post} from "../../models.ts";
import {useRouter} from "vue-router";
import {useHover} from "../../hooks/useHover.ts";

const router = useRouter();
const socket = inject("socket") as Socket;
const me = inject("user") as Ref<User | null>;

const notifications = ref<NotificationType[]>([]);

const { isHovered, bind } = useHover();

watch(me, (newMe) => {
  if (newMe) {
    socket.off(`notification:${newMe.username}`);
    socket.on(`notification:${newMe.username}`, (notification) => {
      console.log(`notification:${newMe.username}:`, notification);
      constructNotification(notification);
    });
  }
}, {immediate: true});

const constructNotification = (notification: any) => {
  let newNotification: NotificationType;
  const post = notification.post as Post || null;
  const truncated = post ? post.body.length > 20 : false;

  switch (notification.type) {
    case "yourPostReply":
      newNotification = {
        type: notification.type,
        timestamp: new Date(),
        description: `New reply to your post`,
        content: post.body.substring(0, Math.min(20, post.body.length)) + (truncated ? "..." : ""),
        link: `/post/${notification.post.id}`,
      };
      break;
    case "yourPostLike":
      let liker = notification.liker as User;
      newNotification = {
        type: notification.type,
        timestamp: new Date(),
        description: `${liker.displayName} liked your post`,
        content: post.body.substring(0, Math.min(20, post.body.length)) + (truncated ? "..." : ""),
        link: `/post/${notification.post.id}`,
      };
      break;
    case "newFollower":
      newNotification = {
        type: notification.type,
        timestamp: new Date(),
        description: `New follower: ${notification.follower.displayName}`,
        content: "",
        link: `/user/${notification.follower.username}`,
      };
      break;
    default:
      newNotification = {
        type: "?",
        timestamp: new Date(),
        description: "?",
        content: "",
        link: "",
      };
  }
  if (newNotification.type !== "?") {
    notifications.value.unshift(newNotification);
  }
};

// TODO: display list on hover, add styles
</script>

<template>
  <div class="notifications" v-if="me" @mouseenter="bind.onMouseEnter()" @mouseleave="bind.onMouseLeave()">
    <div class="new-notifications" v-if="notifications.length > 0">
      <p>{{ notifications.length }}</p>
    </div>
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill="#ffffff">
      <path
          d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/>
    </svg>
    <div class="notification-list" v-if="isHovered && notifications.length > 0">
      <div v-for="notification in notifications" @click="router.push(notification.link)" class="notification">
        <p class="notification-description">{{ notification.description }}</p>
        <p v-if="notification.content" class="notification-content">{{ notification.content }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon {
  fill: $color-text;
}
.notifications {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  background-color: $color-secondary;
  border: 1px solid $color-border;
  border-radius: 0.25rem;
  padding: 0.5rem;
  position: absolute;
  top: 1rem;
  flex: 1;
  width: max-content;
}
.notification {
  flex: 1;
  padding: 0.25rem 0.25rem 0 0.25rem;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
  border-radius: 0.25rem;

  &:not(:first-child) {
    border-top: 1px solid $color-less-important;
  }
  &:hover {
    cursor: pointer;
    background-color: $color-darkgray;
  }
  .notification-description {
    color: $color-text;
    flex: 1;
  }
}
.new-notifications {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #d92d57;
  color: $color-text;
  border-radius: 50%;
  padding: 0.25rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
}
</style>