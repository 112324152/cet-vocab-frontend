import { createRouter, createWebHistory } from 'vue-router'
import StudyPage from '../pages/StudyPage.vue'
import RecordsPage from '../pages/RecordsPage.vue'
import ReaderPage from '../pages/ReaderPage.vue'
import CollectedPage from '../pages/CollectedPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'study', component: StudyPage },
    { path: '/records', name: 'records', component: RecordsPage },
    { path: '/reader', name: 'reader', component: ReaderPage },
    { path: '/collected', name: 'collected', component: CollectedPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
