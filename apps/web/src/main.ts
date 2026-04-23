import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/nunito'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')
