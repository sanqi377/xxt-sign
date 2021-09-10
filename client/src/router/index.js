import Vue from 'vue'
import VueRouter from 'vue-router'
import ajax from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/task',
    name: 'Task',
    component: () => import('../views/Task.vue')
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../views/Logs.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  ajax.defaults.headers.common['token'] = localStorage.getItem("cookie")
  if (to.path != '/') {
    if (localStorage.getItem("cookie")) {
      return next();
    } else {
      return next('/');
    }
  } else {
    return next();
  }
})

export default router
