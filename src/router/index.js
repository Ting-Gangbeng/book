import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/store'
  },
  {
    path: '/ebook',
    component: () => import('../views/ebook/index'),
    children: [
      {
        // 动态路由
        path: ':fileName',
        component: () => import('../components/ebook/EbookReader')
      }
    ]
  },
  {
    path: '/store',
    component: () => import('../views/store/index'),
    redirect: '/store/home',
    children: [
      {
        path: 'shelf',
        component: () => import('../views/store/StoreShelf'),
        meta: { key: 1 }
      },
      {
        path: 'category',
        component: () => import('../views/store/StoreCategory'),
        meta: { key: 2 }
      },
      {
        // 不加斜杠 相对路径
        path: 'home',
        component: () => import('../views/store/StoreHome'),
        meta: { key: 3 }
      },
      {
        path: 'list',
        component: () => import('../views/store/StoreList'),
        meta: { key: 4 }
      },
      {
        path: 'detail',
        component: () => import('../views/store/StoreDetail'),
        meta: { key: 5 }
      }
      // {
      //   path: 'speaking',
      //   component: () => import('../views/store/StoreSpeaking')
      // }
    ]
  }
]

const router = new VueRouter({
  routes
  // mode: 'history'
})

export default router