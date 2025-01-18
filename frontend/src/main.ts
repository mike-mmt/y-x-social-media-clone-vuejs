import {createApp, ref} from 'vue'
import './assets/scss/styles.scss'
import App from './App.vue'
import VueCookies from 'vue-cookies'
import type {VueCookies as VueCookiesType} from "vue-cookies";
import Home from "./components/Home.vue";
import PostView from "./components/postview/PostView.vue";
import {createRouter, createWebHistory} from "vue-router";
import LogIn from "./components/loginview/LogIn.vue";
import MyUserView from "./components/userview/MyUserView.vue";
import UserView from "./components/userview/UserView.vue";
import NotFound from "./components/NotFound.vue";
const routes = [
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/login', component: LogIn},
    { path: '/post/:id', component: PostView, meta: { requiresAuth: true } },
    { path: '/me', component: MyUserView, meta: { requiresAuth: true } },
    { path: '/user/:username', component: UserView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const authToken = ref("");
const setAuthToken = (token: string, cookies: VueCookiesType) => {
    authToken.value = token;
    cookies.set("authToken", token);
};

// router.beforeEach((to, _from, next) => {
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//         // this route requires auth, check if logged in, if not, redirect to login page.
//         const { authToken } = inject('authToken') as { authToken: Ref<string> }
//         if (!authToken.value) {
//             next({ path: '/login' })
//         } else {
//             next() // go to wherever I'm going
//         }
//     } else {
//         next() // does not require auth, make sure to always call next()!
//     }
// })

createApp(App).use(VueCookies, { expires: '30d'}).provide("authToken", {authToken, setAuthToken}).use(router).mount('#app')
