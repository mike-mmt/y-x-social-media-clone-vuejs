<script setup lang="ts">
import {inject, onMounted, provide, ref} from "vue";
import {getAuthToken} from "./services/apiService.ts";
import Sidebar from "./components/home/Sidebar.vue";
import type {VueCookies} from "vue-cookies";

const $cookies = inject<VueCookies>('$cookies');

const authToken = ref("");
const setAuthToken = (token: string) => {
  authToken.value = token;
  $cookies!.set("authToken", token);
};

provide("authToken", {authToken, setAuthToken});

onMounted(() => {
  const token = $cookies!.get("authToken");
  if (token) {
    console.log("Got token from cookie", token); // TODO remove log
    setAuthToken(token);
  } else {
    getAuthToken("userone", "verysecret123").then((token) => {
      console.log("Got token from API", token); // TODO remove log
      setAuthToken(token);
    });
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
