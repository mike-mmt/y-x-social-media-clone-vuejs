<script setup lang="ts">
import {onMounted, provide, ref} from "vue";
import {getAuthToken} from "./services/apiService.ts";
import Sidebar from "./components/home/Sidebar.vue";

const authToken = ref("");
const setAuthToken = (token: string) => {
  authToken.value = token;
};
provide("authToken", {authToken, setAuthToken});

onMounted(() => {
getAuthToken("userone", "verysecret123").then((token) => {
  console.log("Got token", token);
  setAuthToken(token);
});
})
</script>

<template>
  <div class="home">
    <Sidebar/>
    <RouterView />
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
</style>
