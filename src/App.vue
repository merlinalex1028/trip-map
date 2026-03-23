<template>
  <div class="app-shell">
    <div class="app-shell__grain" aria-hidden="true"></div>
    <main class="poster-shell">
      <header class="poster-shell__title" data-region="title">
        <p class="poster-shell__eyebrow">Phase 1 Poster Shell</p>
        <h1>旅行世界地图</h1>
        <p class="poster-shell__guiding-line">点开一枚落点，先从纸上的远方开始回看旅程。</p>
      </header>

      <section class="poster-shell__stage" data-region="map-stage" aria-label="Map stage placeholder">
        <div class="poster-shell__stage-frame">
          <div class="poster-shell__stage-surface">
            <span>map stage placeholder</span>
          </div>
        </div>
      </section>

      <aside class="poster-shell__drawer-host" data-region="drawer-host" aria-label="Drawer host placeholder">
        <span>drawer host placeholder</span>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
}

.app-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(122, 78, 52, 0.08), transparent 28%),
    radial-gradient(circle at 80% 12%, rgba(92, 57, 39, 0.05), transparent 24%),
    radial-gradient(circle at 30% 80%, rgba(146, 112, 74, 0.06), transparent 30%);
  mix-blend-mode: multiply;
  opacity: 0.85;
}

.poster-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.poster-shell__title {
  max-width: 28rem;
  display: grid;
  gap: var(--space-sm);
}

.poster-shell__eyebrow {
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.poster-shell__title h1 {
  margin: 0;
  font-size: var(--font-display-size);
  line-height: var(--font-display-line-height);
  font-weight: var(--font-weight-heading);
  color: var(--color-ink-strong);
}

.poster-shell__guiding-line {
  margin: 0;
  max-width: 22rem;
}

.poster-shell__stage {
  min-height: 60vh;
}

.poster-shell__stage-frame,
.poster-shell__drawer-host {
  border: 1px solid var(--color-frame);
  background: color-mix(in srgb, var(--color-surface) 86%, white 14%);
  box-shadow: var(--shadow-dusty);
}

.poster-shell__stage-frame {
  min-height: 100%;
  padding: var(--space-lg);
}

.poster-shell__stage-surface {
  min-height: 100%;
  display: grid;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--color-frame) 55%, transparent);
  color: var(--color-ink-muted);
}

.poster-shell__drawer-host {
  display: none;
}

@media (min-width: 960px) {
  .poster-shell {
    align-items: start;
    grid-template-columns: minmax(0, 1fr) 20rem;
    grid-template-areas:
      'title drawer'
      'stage drawer';
  }

  .poster-shell__title {
    grid-area: title;
    padding-inline-end: var(--space-xl);
  }

  .poster-shell__stage {
    grid-area: stage;
    min-height: 68vh;
  }

  .poster-shell__drawer-host {
    grid-area: drawer;
    display: block;
    min-height: 24rem;
    padding: var(--space-lg);
    color: var(--color-ink-muted);
  }
}
</style>
