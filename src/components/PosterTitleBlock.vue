<template>
  <header class="poster-title-block" data-region="title">
    <p class="poster-title-block__eyebrow">World Travel Poster</p>
    <h1>旅行世界地图</h1>
    <p class="poster-title-block__guiding-line">点开一枚落点，先从纸上的远方开始回看旅程。</p>
  </header>
</template>

<style scoped>
.poster-title-block {
  max-width: 28rem;
  display: grid;
  gap: var(--space-sm);
}

.poster-title-block__eyebrow {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: var(--font-display-size);
  line-height: var(--font-display-line-height);
  font-weight: var(--font-weight-heading);
}

.poster-title-block__guiding-line {
  margin: 0;
  max-width: 22rem;
}
</style>
