<script setup lang="ts">
import type {Post as PostType} from "../../models.ts";
import LikeIcon from "../post/LikeIcon.vue";
import ReplyIcon from "../post/ReplyIcon.vue";
import {inject, onMounted, ref, type Ref, watch} from "vue";
import {useRoute} from "vue-router";
import {createPost, getPost, getReplies, likePost, unlikePost} from "../../services/apiService.ts";
import Post from "../post/Post.vue";
import ProfileIcon from "../post/ProfileIcon.vue";
import WriteReply from "./WriteReply.vue";

const post = ref<PostType | null>(null);
const parentPost = ref<PostType | null>(null);
const replies = ref<PostType[]>([]);

const route = useRoute();
const {authToken} = inject<{ authToken: Ref<string, string> }>("authToken", {authToken: ref("")});

async function likeOrUnlike() {
  if (post.value && post.value.hasLiked.hasLiked > 0) {
    await unlikePost(post.value.id, authToken.value).then(() => {
      post.value!.hasLiked.hasLiked = 0;
      post.value!.likesCount && post.value!.likesCount--;
      fetchPost(authToken.value);
    });
  } else {
    await likePost(post.value!.id, authToken.value).then(() => {
      post.value!.hasLiked.hasLiked = 1;
      post.value!.likesCount && post.value!.likesCount++;
      fetchPost(authToken.value);
    });
  }
}
async function likeOrUnlikeReply(replyId: string) {
    const reply = replies.value.find((p) => p.id === replyId);
    if (reply && reply.hasLiked.hasLiked > 0) {
      await unlikePost(reply.id, authToken.value).then(() => {
        reply.hasLiked.hasLiked = 0;
        reply.likesCount--;
        // fetchPost(authToken.value);
      });
    } else if (reply) {
      await likePost(reply!.id, authToken.value).then(() => {
        reply.hasLiked.hasLiked = 1;
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
  });
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
</script>

<template>
  <div class="post">
    <p class="back-post-btn" @click="$router.back">← Post</p>
    <div class="repliedTo" v-if="post && post.parent && parentPost">
      <Post :post="parentPost"/>
    </div>
    <div class="actual-post" v-if="post">
      <div class="main-container" v-if="post">
        <div class="post-header-info">
          <ProfileIcon/>
          <div class="names">
            <h3 class="display-name">{{ post.authorDisplayName }}</h3>
            <p class="username">@{{ post.authorUsername }}</p>
          </div>
        </div>
        <div class="post-content">
          <p class="body">{{ post.body }}</p>
        </div>

      </div>
    </div>
    <p class="date-footer" v-if="post">{{ post.datePosted.toLocaleString('pl-PL') }}</p>

    <div class="post-footer" v-if="post">
      <LikeIcon :liked="post.hasLiked.hasLiked > 0" @like-or-unlike="likeOrUnlike"/>
      <p class="likes-count">{{ post.likesCount }}</p>
      <ReplyIcon/>
      <p class="replies-count">{{ post.repliesCount }}</p>
    </div>
    <WriteReply v-if="post" :replying-to="post.authorUsername" @post-reply="writeReply"/>
    <div class="replies" v-if="replies.length > 0">
      <Post v-for="reply in replies" :post="reply" :key="reply.id" :isReply="true" @like-or-unlike="likeOrUnlikeReply"/>
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
    gap: 0.5rem;
  }

  .repliedTo {
    padding: 0.5rem;
    border-bottom: 1px solid #747bff;
    //border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .post-header-info {
      display: flex;
      align-items: center;
      gap: 1rem;

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

</style>