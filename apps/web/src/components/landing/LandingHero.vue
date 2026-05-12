<script setup lang="ts">
const props = defineProps<{
  brandIconSrc: string
  brandWordmarkSrc: string
  registerLabel: string
  loginLabel: string
  registerTrigger: string
  loginTrigger: string
}>()

const emit = defineEmits<{
  register: []
  login: []
}>()
</script>

<template>
  <section class="landing-hero">
    <header class="landing-hero__brand" aria-label="旅记品牌">
      <img
        class="landing-hero__brand-icon"
        :src="props.brandIconSrc"
        alt=""
        aria-hidden="true"
      />
      <img
        class="landing-hero__brand-wordmark"
        :src="props.brandWordmarkSrc"
        alt="旅记"
      />
      <div class="landing-hero__brand-copy">
        <p class="landing-hero__brand-subtitle">探索世界 · 记录美好</p>
      </div>
    </header>

    <div class="landing-hero__content">
      <h1 class="landing-hero__title">
        <span>每一次出发，</span>
        <span>都是与世界的温柔相遇</span>
      </h1>
      <p class="landing-hero__description">
        <span>记录你的旅行足迹，探索世界地图</span>
        <span>收藏每一段回忆，遇见更多美好</span>
      </p>

      <div class="landing-hero__actions">
        <button
          type="button"
          class="landing-hero__action landing-hero__action--primary"
          :data-auth-trigger="props.registerTrigger"
          @click="emit('register')"
        >
          {{ props.registerLabel }}
        </button>
        <button
          type="button"
          class="landing-hero__action landing-hero__action--secondary"
          :data-auth-trigger="props.loginTrigger"
          @click="emit('login')"
        >
          {{ props.loginLabel }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.landing-hero {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 58px;
}

.landing-hero__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
}

.landing-hero__brand-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(244, 93, 154, 0.24));
}

.landing-hero__brand-wordmark {
  width: 58px;
  height: auto;
  object-fit: contain;
  object-position: left center;
}

.landing-hero__brand-copy {
  margin-left: 8px;
}

.landing-hero__brand-subtitle {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #3854c9;
}

.landing-hero__content {
  display: grid;
  gap: 22px;
  max-width: 560px;
  margin-left: 108px;
}

.landing-hero__title {
  display: grid;
  max-width: 540px;
  margin: 0;
  font-family: "STKaiti", "Kaiti SC", "KaiTi", "Songti SC", "Noto Serif SC", serif;
  font-size: 39px;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0;
  color: #2632c2;
  text-wrap: balance;
}

.landing-hero__title span:first-child {
  background: linear-gradient(100deg, #2434c4 0%, #5437c8 52%, #f558a3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.landing-hero__title span:last-child {
  color: #2732c2;
}

.landing-hero__description {
  display: grid;
  gap: 6px;
  max-width: 520px;
  margin: -4px 0 2px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #3244bd;
}

.landing-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.landing-hero__action {
  min-width: 184px;
  min-height: 50px;
  padding: 12px 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  transition: transform var(--motion-quick), box-shadow var(--motion-quick), background-color var(--motion-quick);
}

.landing-hero__action:hover {
  transform: translateY(-2px);
}

.landing-hero__action:focus-visible {
  outline: 2px solid #f75a9b;
  outline-offset: 4px;
}

.landing-hero__action--primary {
  background: linear-gradient(180deg, #ff78b2 0%, #f54792 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    0 13px 23px rgba(247, 90, 155, 0.22);
  color: #fff;
}

.landing-hero__action--secondary {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 249, 255, 0.94));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.78),
    0 11px 20px rgba(98, 84, 160, 0.1);
  color: #6044da;
}

@media (prefers-reduced-motion: reduce) {
  .landing-hero__action {
    transition: none;
  }

  .landing-hero__action:hover {
    transform: none;
  }
}
</style>
