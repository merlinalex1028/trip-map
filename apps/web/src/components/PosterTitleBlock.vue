<template>
  <header class="poster-title-block" data-region="title">
    <p class="poster-title-block__eyebrow">
      <span class="poster-title-block__ribbon">World Travel Poster</span>
    </p>
    <h1 class="poster-title-block__title">旅行世界地图</h1>
    <span class="poster-title-block__underline" aria-hidden="true"></span>
    <p class="poster-title-block__guiding-line">点开一枚落点，先从纸上的远方开始回看旅程。</p>
  </header>
</template>

<style scoped>
.poster-title-block {
  position: relative;
  max-width: 24rem;
  display: grid;
  gap: 0.4rem;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid color-mix(in srgb, var(--color-frame) 60%, white 40%);
  border-radius: var(--radius-surface);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.38));
  box-shadow: var(--shadow-surface);
  overflow: hidden;
}

.poster-title-block::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top right, rgba(132, 199, 216, 0.18), transparent 26%),
    radial-gradient(circle at bottom left, rgba(244, 143, 177, 0.14), transparent 24%);
}

.poster-title-block__eyebrow {
  margin: 0;
}

.poster-title-block__ribbon {
  display: inline-flex;
  align-items: center;
  min-height: 1.6rem;
  padding-inline: var(--space-sm);
  border: 1px solid color-mix(in srgb, var(--color-accent) 42%, white 58%);
  border-radius: var(--radius-pill);
  background:
    linear-gradient(135deg, var(--color-state-selected-wash), rgba(255, 255, 255, 0.94));
  color: var(--color-accent);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 10px 18px rgba(120, 86, 122, 0.12);
}

.poster-title-block__title {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: var(--font-weight-heading);
}

.poster-title-block__underline {
  width: 4rem;
  height: 0.3rem;
  border-radius: var(--radius-pill);
  background:
    linear-gradient(
      90deg,
      var(--color-state-selected),
      color-mix(in srgb, var(--color-state-selected-wash) 76%, white 24%)
    );
  box-shadow: 0 8px 18px rgba(244, 143, 177, 0.28);
}

.poster-title-block__guiding-line {
  margin: 0;
  max-width: 22rem;
  color: var(--color-ink-muted);
  font-size: 0.8rem;
}
</style>
