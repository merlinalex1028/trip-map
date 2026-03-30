import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import '../../../src/styles/tokens.css'
import '../../../src/styles/global.css'

// Temporary bridge: apps/web owns the app shell, but supporting runtime modules and styles still live in the root src tree.
createApp(App).use(createPinia()).mount('#app')
