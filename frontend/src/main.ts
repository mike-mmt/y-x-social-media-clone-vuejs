import { createApp } from 'vue'
import './assets/scss/styles.scss'
import App from './App.vue'
import VueCookies from 'vue-cookies'
import Home from "./components/Home.vue";
import PostView from "./components/postview/PostView.vue";
import {createRouter, createWebHistory} from "vue-router";
import LogIn from "./components/loginview/LogIn.vue";
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: LogIn},
    { path: '/:id', component: PostView  },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(VueCookies, { expires: '30d'}).use(router).mount('#app')
