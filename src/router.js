import { createRouter, createWebHistory } from "vue-router"
import Login from "./views/LoginPage.vue"
import Home from "./views/HomePage.vue"


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        { path: '/home', component: Home}

    ]
})

export default router