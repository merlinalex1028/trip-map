<script setup lang="ts">
import LandingHero from './LandingHero.vue'
import LandingTreasurePanel from './LandingTreasurePanel.vue'
import logoCatOutline from '@/assets/v8/mascots/logo-cat-outline.png'
import brandWordmark from '@/assets/v8/landing/brand-wordmark.png'
import landingFullBg from '@/assets/v8/landing/landing-full-bg.png'
import travelPostcards from '@/assets/v8/landing/travel-postcards.png'
import { useAuthSessionStore } from '@/stores/auth-session'

const authSessionStore = useAuthSessionStore()

function openRegisterModal() {
  authSessionStore.openAuthModal('register')
}

function openLoginModal() {
  authSessionStore.openAuthModal('login')
}
</script>

<template>
  <main class="landing-page">
    <div class="landing-page__stage">
      <div
        class="landing-page__scene"
        :style="{ backgroundImage: `url(${landingFullBg})` }"
        aria-hidden="true"
      ></div>

      <section class="landing-page__hero-slot">
        <LandingHero
          :brand-icon-src="logoCatOutline"
          :brand-wordmark-src="brandWordmark"
          register-label="开始记录旅途 ✨"
          login-label="探索世界地图 📖"
          register-trigger="landing-register"
          login-trigger="landing-hero-login"
          @register="openRegisterModal"
          @login="openLoginModal"
        />
      </section>

      <section class="landing-page__treasure-slot">
        <LandingTreasurePanel
          :postcards-src="travelPostcards"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.landing-page {
  min-height: 100svh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 228, 241, 0.84), transparent 34%),
    linear-gradient(180deg, #fff8fd 0%, #fafaff 52%, #fff8fd 100%);
}

.landing-page__stage {
  position: relative;
  width: 100vw;
  min-height: 66.71vw;
  margin: 0 auto;
}

.landing-page__scene {
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 0;
  width: 100vw;
  height: 66.71vw;
  max-width: none;
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 100%;
  transform: translateX(-50%);
  pointer-events: none;
}

.landing-page__hero-slot,
.landing-page__treasure-slot {
  z-index: 1;
}

.landing-page__hero-slot {
  position: relative;
  width: 100%;
  padding-top: 34px;
  padding-left: 36px;
}

.landing-page__treasure-slot {
  position: absolute;
  right: 0;
  bottom: clamp(42px, 3.7vw, 72px);
  left: 0;
  height: clamp(346px, 25.4vw, 520px);
}
</style>
