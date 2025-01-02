<script setup lang="ts">
import {inject, onMounted, provide, type Ref, ref, watch} from "vue";
import {getMyUser, getUser, validateToken} from "./services/apiService.ts";
import Sidebar from "./components/Sidebar.vue";
import type {VueCookies} from "vue-cookies";
import {Feeds} from "./enums/feeds.enum.ts";
import {useRouter} from "vue-router";
import type {User} from "./models.ts";

const $cookies = inject<VueCookies>('$cookies');

// const authToken = ref("");
// const setAuthToken = (token: string) => {
//   authToken.value = token;
//   $cookies!.set("authToken", token);
// };
// provide("authToken", {authToken, setAuthToken});
const {authToken, setAuthToken} = inject("authToken") as { authToken: Ref<string>, setAuthToken: (token: string, cookies: VueCookies) => void };
const router = useRouter();

const feed = ref(Feeds.ForYou);
const user = ref<User | null>(null);

provide("user", user);

function switchFeed(newFeed: Feeds) {
  feed.value = newFeed;
}
provide("feed", {feed, switchFeed});

watch(authToken, (newToken) => {
  if (newToken) {
    getMyUser(newToken).then((newUser) => {
      user.value = newUser;
    });
  }
});

onMounted(() => {
  const token = $cookies!.get("authToken");
  if (token) {
    validateToken(token).then((isValid) => {
      if (isValid) {
        setAuthToken(token, $cookies!);
        return;
      } else {
        router.push("/login");
      }
    });
  } else {
    router.push("/login");
  }
});
</script>

<template>
  <div class="home">
    <Sidebar/>
    <RouterView class="router-view" />
  </div>
</template>

<style scoped lang="scss">
.home {
  width: 100%;
}
.home {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.router-view {
  width: 60%;
}
</style>
