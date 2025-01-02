<script setup lang="ts">

import {inject, onMounted, ref, type Ref, watch} from "vue";
import type {User} from "../../models.ts";
import ProfileIcon from "../post/ProfileIcon.vue";
import {
  blockUser,
  followUser,
  getBlocked,
  getFollowers,
  getFollowing,
  getMuted, muteUser, unblockUser,
  unfollowUser,
  unmuteUser
} from "../../services/apiService.ts";
import BlockButton from "../postview/BlockButton.vue";
import FollowButton from "../postview/FollowButton.vue";
import MuteButton from "../postview/MuteButton.vue";

const user = inject("user") as Ref<User | null>;
const {authToken} = inject("authToken") as { authToken: Ref<string> };
const followers = ref<User[]>([]);
const following = ref<User[]>([]);
const muted = ref<User[]>([]);
const blocked = ref<User[]>([]);

async function fetchAll() {
  if (user.value) {
    followers.value = await getFollowers(user.value.username, authToken.value)
    following.value = await getFollowing(user.value.username, authToken.value)
    muted.value = await getMuted(user.value.username, authToken.value)
    blocked.value = await getBlocked(user.value.username, authToken.value)
  }
}

async function followOrUnfollow(userToEdit: User) {
  if (userToEdit.isFollowing) {
    if (await unfollowUser(userToEdit.username, authToken.value)) {
      userToEdit.isFollowing = 0;
    }
  } else {
    if (await followUser(userToEdit.username, authToken.value)) {
      userToEdit.isFollowing = 1;
    }
  }
  if (user.value) {
    followers.value = await getFollowers(user.value.username, authToken.value)
    following.value = await getFollowing(user.value.username, authToken.value)
  }
}

async function muteOrUnmute(userToEdit: User) {
  if (userToEdit) {
    if (userToEdit.isMuted) {
      if (await unmuteUser(userToEdit.username, authToken.value)) {
        userToEdit.isMuted = 0;
      }
    } else {
      if (await muteUser(userToEdit.username, authToken.value)) {
        userToEdit.isMuted = 1;
      }
    }
  }
  if (user.value) {
    muted.value = await getMuted(user.value.username, authToken.value)
  }
}

async function blockOrUnblock(userToEdit: User) {
  if (userToEdit) {
    if (userToEdit.isBlocked) {
      if (await unblockUser(userToEdit.username, authToken.value)) {
        userToEdit.isBlocked = 0;
      }
    } else {
      if (await blockUser(userToEdit.username, authToken.value)) {
        userToEdit.isBlocked = 1;
      }
    }
  }
  if (user.value) {
    blocked.value = await getBlocked(user.value.username, authToken.value)
  }
}

onMounted(() => {
  fetchAll();
  watch(user, () => {
    fetchAll();
  })
  console.log(user.value);
})
</script>

<template>
  <div class="user-view">
    <div class="me" v-if="user">
      <ProfileIcon/>
      <div class="names">
        <h3 class="display-name">{{ user.displayName }}</h3>
        <p class="username">@{{ user.username }}</p>
      </div>
    </div>
    <div v-if="user" class="lists">
      <div class="column bigger-column">
        <p class="list-header">{{ user.followersCount }} Followers</p>
        <div class="followers-list list">
          <div class="list-item" v-for="follower in followers">
            <ProfileIcon/>
            <div class="names">
              <h3 class="display-name">{{ follower.displayName }}</h3>
              <p class="username">@{{ follower.username }}</p>
            </div>
            <FollowButton :is-following="follower.isFollowing" :user="follower" @followOrUnfollow="followOrUnfollow"/>
            <MuteButton class="mute-block-btn" :is-muted="follower.isMuted" :user="follower"
                        @mute-or-unmute="muteOrUnmute"/>
            <BlockButton class="mute-block-btn" :is-blocked="follower.isBlocked" :user="follower"
                         @block-or-unblock="blockOrUnblock"/>
          </div>
        </div>
      </div>
      <div class="column bigger-column">
        <p class="list-header">{{ user.followingCount }} Following</p>

        <div class="muted-list list">
          <div class="list-item" v-for="followedUser in following">
            <ProfileIcon/>
            <div class="names">
              <h3 class="display-name">{{ followedUser.displayName }}</h3>
              <p class="username">@{{ followedUser.username }}</p>
            </div>
            <FollowButton :is-following="followedUser.isFollowing" :user="followedUser"
                          @followOrUnfollow="followOrUnfollow"/>
            <MuteButton class="mute-block-btn" :is-muted="followedUser.isMuted" :user="followedUser"
                        @mute-or-unmute="muteOrUnmute"/>
            <BlockButton class="mute-block-btn" :is-blocked="followedUser.isBlocked" :user="followedUser"
                         @block-or-unblock="blockOrUnblock"/>
          </div>
        </div>


      </div>
      <div class="column">
        <p class="list-header">Muted</p>

        <div class="muted-list list">
          <div class="list-item" v-for="mutedUser in muted">
            <ProfileIcon/>
            <div class="names">
              <h3 class="display-name">{{ mutedUser.displayName }}</h3>
              <p class="username">@{{ mutedUser.username }}</p>
            </div>
            <MuteButton class="mute-block-btn" :is-muted="mutedUser.isMuted" :user="mutedUser"
                        @mute-or-unmute="muteOrUnmute"/>
          </div>
        </div>

      </div>
      <div class="column">
        <p class="list-header">Blocked</p>

        <div class="muted-list list">
          <div class="list-item" v-for="blockedUser in blocked">
            <ProfileIcon/>
            <div class="names">
              <h3 class="display-name">{{ blockedUser.displayName }}</h3>
              <p class="username">@{{ blockedUser.username }}</p>
            </div>
            <BlockButton class="mute-block-btn" :is-blocked="blockedUser.isBlocked" :user="blockedUser"
                         @block-or-unblock="blockOrUnblock"/>
          </div>
        </div>

      </div>
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
  width: 100%;
}

.me {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.names {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  color: $color-less-important;
}

.lists {
  border-top: 1px solid $color-border;
  display: flex;
  gap: 1rem;
  width: 100%;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.list-header {
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid $color-darkgray;
  width: 100%;
  text-align: center;
  margin-bottom: 0.5rem;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bigger-column {
  flex: 2;
}

.list-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>