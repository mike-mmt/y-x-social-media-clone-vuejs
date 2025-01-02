<script setup lang="ts">

import ProfileIcon from "../post/ProfileIcon.vue";
import {inject, onMounted, type Ref, ref} from "vue";
import {
  blockUser,
  followUser,
  getUser, getUserPosts, likePost,
  muteUser,
  unblockUser,
  unfollowUser, unlikePost,
  unmuteUser
} from "../../services/apiService.ts";
import type {User} from "../../models.ts";
import {useRoute} from "vue-router";
import FollowButton from "../postview/FollowButton.vue";
import MuteButton from "../postview/MuteButton.vue";
import BlockButton from "../postview/BlockButton.vue";
import Post from "../post/Post.vue";
import type {Post as PostType} from "../../models.ts";
import {gsap} from "gsap";

const route = useRoute();
const user = ref<User | null>(null);
const userPosts = ref<PostType[]>([]);
const page = ref(0);
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken") as { authToken: Ref<string> };
const animationDone = ref(false);

async function followOrUnfollow() {
  if (user.value) {
    if (user.value.isFollowing) {
      if (await unfollowUser(user.value.username, authToken.value)) {
        user.value.isFollowing = 0;
        user.value.followersCount--;
      }
    } else {
      if (await followUser(user.value.username, authToken.value)) {
        user.value.isFollowing = 1;
        user.value.followersCount++;
      }
    }
  }
}

async function muteOrUnmute() {
  if (user.value) {
    if (user.value.isMuted) {
      if (await unmuteUser(user.value.username, authToken.value)) {
        user.value.isMuted = 0;
      }
    } else {
      if (await muteUser(user.value.username, authToken.value)) {
        user.value.isMuted = 1;
      }
    }
  }
}

async function blockOrUnblock() {
  if (user.value) {
    if (user.value.isBlocked) {
      if (await unblockUser(user.value.username, authToken.value)) {
        user.value.isBlocked = 0;
      }
    } else {
      if (await blockUser(user.value.username, authToken.value)) {
        user.value.isBlocked = 1;
      }
    }
  }
}

function fetchPosts() {
  if (user.value) {
    getUserPosts(user.value.username, page.value, authToken.value).then((newPosts) => {
      userPosts.value = newPosts;
    });
  }
};

function fetchMorePosts() {
  page.value++;
  if (user.value) {
    getUserPosts(user.value.username, page.value, authToken.value).then((newPosts) => {
      userPosts.value = userPosts.value.concat(newPosts);
      if (newPosts.length === 0) {
        page.value--;
      }
    });
  }
}

async function likeOrUnlike(postId: string) {
  const post = userPosts.value.find((p) => p.id === postId);
  if (post && post.hasLiked > 0) {
    await unlikePost(post.id, authToken.value).then(() => {
      post.hasLiked = 0;
      post.likesCount--;
      // fetchPost(authToken.value);
    });
  } else if (post) {
    await likePost(post!.id, authToken.value).then(() => {
      post.hasLiked = 1;
      post.likesCount++;
      // fetchPost(authToken.value);
    });
  }
}
function onEnter(el: any, done: any) {
  animationDone.value = false;
  gsap.to(el, {
    opacity: 1,
    height: "auto",
    delay: el.dataset.index * 0.15,
    onComplete: () => {
      done()
      setTimeout(() => {
        animationDone.value = true;
      }, 1000);
    }
  })
}
function beforeEnter(el: any) {
  gsap.set(el, { opacity: 0, height: 0 })
}
onMounted(() => {
  getUser(route.params.username as string, authToken.value).then((newUser) => {
    user.value = newUser;
    fetchPosts();
  });
});

</script>

<template>
  <div class="user-view">
    <div class="user" v-if="user">
      <ProfileIcon/>
      <div class="names">
        <h3 class="display-name">{{ user.displayName }}</h3>
        <p class="username">@{{ user.username }}</p>
      </div>
      <p class="follow-info">{{ user.followersCount }} Followers</p>
      <p class="follow-info">{{ user.followingCount }} Following</p>
      <FollowButton :is-following="user.isFollowing" :follow="followOrUnfollow"/>
      <div class="divider"></div>
      <MuteButton :is-muted="user.isMuted" :mute="muteOrUnmute"/>
      <BlockButton :is-blocked="user.isBlocked" :block="blockOrUnblock"/>
    </div>
    <div class="posts">
      <TransitionGroup name="feed-list" :css="false"  @before-enter="beforeEnter" @enter="onEnter" @leave="" >
        <Post v-for="(post, index) in userPosts" :post="post" :key="post.id" class="feed-item" @like-or-unlike="likeOrUnlike" :data-index="index"/>
      </TransitionGroup>
      <div v-if="animationDone" class="fetch-more" @click="fetchMorePosts">Fetch more posts</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-view {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 50%;
}

.user {
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.follow-info {
  padding-left: 1rem;
  border-left: 1px solid $color-border;
}
.posts {
  border-top: 1px solid $color-border;
  display: flex;
  width: 100%;
  padding-top: 1rem;
  margin-top: 2rem;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 2rem;
}
.divider {
  flex: 1;
}
.fetch-more {
  background-color: $color-secondary;
  padding: 1rem 2rem;
  width: 100%;
  text-align: center;
  border: 1px solid $color-green;
  border-radius: 0.25rem;
  transition: all 0.3s;
  &:hover {
    cursor: pointer;
    border-color: $color-text;
  }
}
</style>