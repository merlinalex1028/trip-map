import { createPinia } from 'pinia'
import { createApp } from 'vue'

import LegacyApp from '../../../src/App.vue'
import '../../../src/styles/tokens.css'
import '../../../src/styles/global.css'

// Temporary bridge: apps/web owns the package bootstrap while the runtime still lives in the root src tree.
createApp(LegacyApp).use(createPinia()).mount('#app')
