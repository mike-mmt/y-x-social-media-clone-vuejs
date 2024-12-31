<script setup lang="ts">
import {inject, ref} from "vue";

enum Tabs {
  LogIn = 'log-in',
  Register = 'register',
}
const activeTab = ref<Tabs>(Tabs.LogIn);
const username = ref('');
const email = ref('');
const password = ref('');

// TODO: Implement login and register functionality: create apiService.login(usrnm, pwd, setAuthToken)
const { setAuthToken } = inject("authToken") as { setAuthToken: (token: string) => void };


</script>

<template>
<div class="container">
  <div class="switcher">
    <button
      :class="{ active: activeTab === Tabs.LogIn }"
      class="switcher-btn"
      @click="activeTab = Tabs.LogIn"
    >
      Log In
    </button>
    <button
      :class="{ active: activeTab === Tabs.Register }"
      class="switcher-btn"
      @click="activeTab = Tabs.Register"
    >
      Register
    </button>
  </div>
  <div v-if="activeTab === Tabs.LogIn" class="form">
    <label for="username">Username</label>
    <input  class="input" type="text" id="username" placeholder="Username" v-model="username" />
    <label for="password">Password</label>
    <input  class="input" type="password" id="password" placeholder="Password" v-model="password"/>
    <button @click="" class="login-btn">Log In</button>
  </div>
  <div v-if="activeTab === Tabs.Register" class="form">
    <label for="username">Username</label>
    <input class="input" type="text" id="username" placeholder="Username" v-model="username"/>
    <label for="email">E-mail</label>
    <input class="input" type="email" id="email" placeholder="E-mail" v-model="email"/>
    <label for="password">Password</label>
    <input  class="input" type="password" id="password" placeholder="Password" v-model="password"/>
    <button class="login-btn">Create account</button>
  </div>
</div>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .input {
    padding: 1rem 2rem;
    border-radius: 0.25rem;
    border: 1px solid $color-green;
    background-color: $color-secondary;
    &:focus {
      outline: none;
      border: 3px solid $color-green;
    }
  }
  .login-btn {
    padding: 0.5rem;
    border: none;
    background-color: $color-green;
    color: $color-text;
    border-radius: 0.25rem;
    transition-duration: 200ms;
    &:hover {
      cursor: pointer;
    }
    &:active {
      transform: translateY(2px);

    }
  }
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid $color-green;
  border-radius: 0.5rem;
  padding: 2rem 2rem;
  gap: 2rem;
  min-height: 50vh;
}
.switcher-btn {
  background-color: transparent;
  color: $color-text;
  padding: 0.5rem 1rem;
  border: $color-green;
  transition-duration: 200ms;
  &:hover {
    cursor: pointer;
  }
  &:active {
    transform: translateY(2px);
  }
}
.active {
  background-color: $color-green;
}

</style>