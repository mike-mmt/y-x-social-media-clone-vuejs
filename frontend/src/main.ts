import { createApp } from 'vue'
import './assets/scss/styles.scss'
import App from './App.vue'

import Home from "./components/Home.vue";
import PostView from "./components/PostView.vue";
import {createRouter, createWebHistory} from "vue-router";
const routes = [
    { path: '/', component: Home },
    { path: '/:id', component: PostView  },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
