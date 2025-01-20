<script setup lang="ts">
import type {Post as PostType, User} from "../../models.ts";
import LikeIcon from "../post/LikeIcon.vue";
import ReplyIcon from "../post/ReplyIcon.vue";
import {inject, onMounted, ref, type Ref, watch} from "vue";
import {useRoute} from "vue-router";
import {
  blockUser,
  createPost, followUser,
  getPost,
  getReplies,
  getUser,
  likePost, muteUser, unblockUser,
  unfollowUser,
  unlikePost, unmuteUser
} from "../../services/apiService.ts";
import Post from "../post/Post.vue";
import ProfileIcon from "../post/ProfileIcon.vue";
import WriteReply from "./WriteReply.vue";
import PostMedia from "../post/PostMedia.vue";
import FollowButton from "./FollowButton.vue";
import MuteButton from "./MuteButton.vue";
import BlockButton from "./BlockButton.vue";
import MutedPost from "./MutedPost.vue";

const post = ref<PostType | null>(null);
const parentPost = ref<PostType | null>(null);
const replies = ref<PostType[]>([]);

const user =ref<User | null>(null)

const route = useRoute();
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

const me = inject("user") as Ref<User | null>;

async function likeOrUnlike() {
  if (post.value && post.value.hasLiked > 0) {
    await unlikePost(post.value.id, authToken.value).then(() => {
      post.value!.hasLiked = 0;
      post.value!.likesCount && post.value!.likesCount--;
      fetchPost(authToken.value);
    });
  } else {
    await likePost(post.value!.id, authToken.value).then(() => {
      post.value!.hasLiked = 1;
      post.value!.likesCount && post.value!.likesCount++;
      fetchPost(authToken.value);
    });
  }
}
async function likeOrUnlikeReply(replyId: string) {
    const reply = replies.value.find((p) => p.id === replyId);
    if (reply && reply.hasLiked> 0) {
      await unlikePost(reply.id, authToken.value).then(() => {
        reply.hasLiked = 0;
        reply.likesCount--;
        // fetchPost(authToken.value);
      });
    } else if (reply) {
      await likePost(reply!.id, authToken.value).then(() => {
        reply.hasLiked = 1;
        reply.likesCount++;
        // fetchPost(authToken.value);
      });
    }
}

async function fetchPost(authToken: string) {
  getPost(route.params.id as string, authToken).then((newPost) => {
    console.log(newPost);
    post.value = newPost;
    if (newPost.parent) {
      getPost(newPost.parent, authToken).then((parent) => {
        parentPost.value = parent;
      });
    }
    if (newPost['in_Replied']) {
      getReplies(newPost.id, authToken).then((newReplies) => {
        replies.value = newReplies;
        console.log('replies', replies.value);
      });
    } else {
      replies.value = [];
    }
    getUser(newPost.authorUsername, authToken).then((newUser) => {
      user.value = newUser;
      console.log('user', user.value);
    });
  });
}
async function fetchReplies() {
  if (post.value) {
    getReplies(post.value.id, authToken.value).then((newReplies) => {
      replies.value = newReplies;
    });
  }
}

async function followOrUnfollow() {
  if (user.value) {
    if (user.value.isFollowing) {
      if (await unfollowUser(user.value.username, authToken.value)) {
        user.value.isFollowing = 0;
      }
    } else {
      if (await followUser(user.value.username, authToken.value)) {
        user.value.isFollowing = 1;
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

onMounted(async () => {
  if (authToken.value !== "") {
    fetchPost(authToken.value)
  } else {
    watch(authToken, async (newToken: string) => {
      fetchPost(newToken)
    })
  }

})

function writeReply(body: string, media: string) {
  if (post.value) {
    createPost(body, media, post.value.id, authToken.value).then((newPost) => {
      console.log(newPost);
      replies.value.push(newPost);
      post.value!.repliesCount!++;
    });
  }
}

watch(
    () => route.params.id,
    (newId, oldId) => {
      console.log("detected change in route", newId, oldId)
      fetchPost(authToken.value)
    }
)
// TODO: hide buttons if author is the same as logged in user
</script>

<template>
  <div class="post">
    <p class="back-post-btn" @click="$router.back">← Post</p>
    <div class="repliedTo" v-if="post && post.parent && parentPost">
      <Post :post="parentPost"/>
    </div>
    <div class="actual-post" v-if="post">
      <p class="replying-to" v-if="post && post.parent && parentPost">Replying to: <span class="replying-to-username">@{{ parentPost.authorUsername }}</span></p>
      <div class="main-container" v-if="post">
        <div class="post-header-info">
          <ProfileIcon/>
          <div class="names" @click.stop="$router.push(`/user/${post.authorUsername}`)">
            <h3 class="display-name">{{ post.authorDisplayName }}</h3>
            <p class="username">@{{ post.authorUsername }}</p>
          </div>
          <FollowButton v-if="user && user.username !== me?.username" :is-following="user.isFollowing" @followOrUnfollow="followOrUnfollow"/>
          <div class="divider"> </div>
          <MuteButton class="mute-block-btn" v-if="user && user.username !== me?.username" :is-muted="user.isMuted" @mute-or-unmute="muteOrUnmute"/>
          <BlockButton class="mute-block-btn" v-if="user && user.username !== me?.username" :is-blocked="user.isBlocked" @block-or-unblock="blockOrUnblock"/>
        </div>
        <div class="post-content">
          <p class="body">{{ post.body }}</p>
          <PostMedia v-if="post.media" :url="post.media"/>
        </div>

      </div>
    </div>
    <p class="date-footer" v-if="post">{{ post.datePosted.toLocaleString('pl-PL') }}</p>

    <div class="post-footer" v-if="post">
      <LikeIcon :liked="post.hasLiked > 0" @like-or-unlike="likeOrUnlike"/>
      <p class="likes-count">{{ post.likesCount }}</p>
      <ReplyIcon/>
      <p class="replies-count">{{ post.repliesCount }}</p>
    </div>
    <WriteReply v-if="post" :replying-to="post.authorUsername" @post-reply="writeReply"/>
    <div class="replies" v-if="replies.length > 0">
      <template v-for="reply in replies" :key="reply.id">
        <MutedPost v-if="reply.isMuted > 0" :post="reply" @reloadReplies="fetchReplies" />
        <Post v-else :post="reply"  :isReply="true" @like-or-unlike="likeOrUnlikeReply"/>
      </template>
    </div>

  </div>
</template>

<style scoped lang="scss">
.post {
  &:hover {
    cursor: pointer;
  }

  display: flex;
  flex-direction: column;
  //padding: 1rem;
  border: 1px solid #747bff;
  border-radius: 0.5rem;
  //gap: 1rem;
  .actual-post {
    display: flex;
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
  }

  .repliedTo {
    padding: 0.5rem;
    border-bottom: 1px solid #747bff;
    //border-radius: 0.5rem;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    .post-header-info {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      width: 100%;
      .username {
        color: $color-less-important;
      }

      .date {
        color: $color-less-important;
      }
    }
  }

  .date-footer {
    border-top: 1px solid #747bff;
    margin-left: 1rem;
    padding: 1rem 0;

    color: $color-less-important;
  }

  .post-footer {
    margin-left: 1rem;
    padding: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-top: 1px solid #747bff;

    :nth-child(2) {
      margin-right: 1rem;
    }
  }
  .names {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .back-post-btn {
    padding: 0.5rem;
    border-bottom: 1px solid #747bff;
    color: $color-text;

    &:hover {
      cursor: pointer;
    }
  }
}

.divider {
  flex: 1;
}
.replying-to {
  color: $color-text;
}
.replying-to-username {
  color: $color-green;
}
</style>