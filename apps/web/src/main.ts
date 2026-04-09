import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/nunito'
import App from './App.vue'
import './style.css'

createApp(App).use(createPinia()).mount('#app')
