<script setup lang="ts">
import {inject, onMounted, provide, type Ref, ref, watch} from "vue";
import {getMyUser, validateToken} from "./services/apiService.ts";
import Sidebar from "./components/Sidebar.vue";
import type {VueCookies} from "vue-cookies";
import {Feeds} from "./enums/feeds.enum.ts";
import {useRouter} from "vue-router";
import type {User} from "./models.ts";

const $cookies = inject<VueCookies>('$cookies');
const {authToken, setAuthToken} = inject("authToken") as { authToken: Ref<string>, setAuthToken: (token: string, cookies: VueCookies) => void };
const router = useRouter();
const feed = ref(Feeds.ForYou);
const user = ref<User | null>(null);

provide("user", user);
provide("feed", {feed, switchFeed});
// provide("logOut", logOut);

function logOut() {
  console.log("Logging out");
  setAuthToken("", $cookies!);
  $cookies!.remove("authToken");
  user.value = null;
  router.push("/login");
}

function switchFeed(newFeed: Feeds) {
  feed.value = newFeed;
}

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
        if (router.currentRoute.value.path === "/login") {
          router.push("/");
        }
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
    <Sidebar :logout="logOut"/>
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
