<script setup lang="ts">
import type { JournalPostcardVariant } from './journal-thumbnails'

const props = defineProps<{
  variant: JournalPostcardVariant
}>()
</script>

<template>
  <div
    class="journal-postcard relative min-h-[156px] overflow-hidden rounded-[24px] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:min-h-[190px]"
    :class="`journal-postcard--${props.variant}`"
    data-journal-postcard
    :data-variant="props.variant"
    aria-hidden="true"
  >
    <div class="journal-postcard__wash" />
    <div class="journal-postcard__sun" />
    <div class="journal-postcard__moon" />
    <div class="journal-postcard__cloud journal-postcard__cloud--first" />
    <div class="journal-postcard__cloud journal-postcard__cloud--second" />
    <div class="journal-postcard__backdrop" />
    <div class="journal-postcard__land journal-postcard__land--back" />
    <div class="journal-postcard__land journal-postcard__land--front" />
    <div class="journal-postcard__river" />
    <div class="journal-postcard__skyline">
      <span class="journal-postcard__tower journal-postcard__tower--short" />
      <span class="journal-postcard__tower journal-postcard__tower--tall" />
      <span class="journal-postcard__tower journal-postcard__tower--wide" />
    </div>
    <div class="journal-postcard__temple">
      <span class="journal-postcard__temple-roof" />
      <span class="journal-postcard__temple-body" />
    </div>
    <div class="journal-postcard__sparkle journal-postcard__sparkle--first" />
    <div class="journal-postcard__sparkle journal-postcard__sparkle--second" />
  </div>
</template>

<style scoped>
.journal-postcard {
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.92), transparent 22%),
    linear-gradient(145deg, #ffe7f3 0%, #eef2ff 54%, #dff8ff 100%);
  isolation: isolate;
}

.journal-postcard__wash,
.journal-postcard__sun,
.journal-postcard__moon,
.journal-postcard__cloud,
.journal-postcard__backdrop,
.journal-postcard__land,
.journal-postcard__river,
.journal-postcard__skyline,
.journal-postcard__temple,
.journal-postcard__sparkle {
  position: absolute;
  pointer-events: none;
}

.journal-postcard__wash {
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 48%),
    radial-gradient(circle at 76% 18%, rgba(255, 255, 255, 0.5), transparent 20%);
}

.journal-postcard__sun {
  top: 20px;
  right: 24px;
  z-index: 2;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(255, 232, 157, 0.88);
  box-shadow: 0 0 32px rgba(255, 201, 116, 0.42);
}

.journal-postcard__moon {
  top: 22px;
  right: 30px;
  z-index: 2;
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #fff7d9;
  box-shadow: -10px 0 0 rgba(130, 112, 190, 0.48), 0 0 30px rgba(255, 247, 217, 0.5);
}

.journal-postcard__cloud {
  z-index: 3;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    18px -10px 0 rgba(255, 255, 255, 0.78),
    38px -3px 0 rgba(255, 255, 255, 0.68);
}

.journal-postcard__cloud--first {
  top: 34px;
  left: 22px;
  width: 58px;
}

.journal-postcard__cloud--second {
  top: 70px;
  right: 38px;
  width: 46px;
  opacity: 0.72;
}

.journal-postcard__backdrop {
  left: -10%;
  right: -10%;
  bottom: 36px;
  z-index: 4;
  height: 76px;
  border-radius: 48% 52% 0 0;
  background: rgba(154, 197, 239, 0.4);
}

.journal-postcard__land {
  left: -12%;
  right: -12%;
  z-index: 5;
  border-radius: 50% 50% 0 0;
}

.journal-postcard__land--back {
  bottom: 22px;
  height: 74px;
  background: rgba(181, 220, 199, 0.72);
}

.journal-postcard__land--front {
  bottom: -28px;
  height: 88px;
  background: rgba(147, 203, 184, 0.78);
}

.journal-postcard__river {
  left: 38%;
  bottom: -8px;
  z-index: 6;
  width: 26%;
  height: 92px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, rgba(182, 235, 255, 0.9), rgba(126, 193, 235, 0.56));
  transform: skewX(-14deg);
}

.journal-postcard__skyline {
  right: 24px;
  bottom: 44px;
  z-index: 7;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  opacity: 0;
}

.journal-postcard__tower {
  display: block;
  width: 18px;
  border-radius: 8px 8px 0 0;
  background: rgba(111, 108, 176, 0.58);
}

.journal-postcard__tower--short {
  height: 34px;
}

.journal-postcard__tower--tall {
  height: 58px;
}

.journal-postcard__tower--wide {
  width: 28px;
  height: 42px;
}

.journal-postcard__temple {
  left: 28px;
  bottom: 46px;
  z-index: 7;
  display: none;
  width: 78px;
  height: 62px;
}

.journal-postcard__temple-roof,
.journal-postcard__temple-body {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.journal-postcard__temple-roof {
  top: 0;
  width: 74px;
  height: 24px;
  border-radius: 50% 50% 8px 8px;
  background: rgba(244, 135, 167, 0.78);
  clip-path: polygon(50% 0, 100% 70%, 88% 100%, 12% 100%, 0 70%);
}

.journal-postcard__temple-body {
  bottom: 0;
  width: 48px;
  height: 42px;
  border-radius: 12px 12px 4px 4px;
  background: rgba(255, 244, 226, 0.88);
}

.journal-postcard__sparkle {
  z-index: 8;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.9);
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
}

.journal-postcard__sparkle--first {
  top: 28px;
  left: 62%;
}

.journal-postcard__sparkle--second {
  top: 78px;
  left: 18%;
  opacity: 0.7;
}

.journal-postcard--clouds {
  background:
    radial-gradient(circle at 22% 24%, rgba(255, 255, 255, 0.96), transparent 24%),
    linear-gradient(145deg, #ffeaf6 0%, #f5f0ff 44%, #dff8ff 100%);
}

.journal-postcard--starlight {
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.24), transparent 18%),
    linear-gradient(145deg, #6f64b8 0%, #9f83da 48%, #f3b9d7 100%);
}

.journal-postcard--starlight .journal-postcard__sun {
  display: none;
}

.journal-postcard--starlight .journal-postcard__moon {
  display: block;
}

.journal-postcard--starlight .journal-postcard__cloud {
  opacity: 0.28;
}

.journal-postcard--city .journal-postcard__skyline,
.journal-postcard--skyline .journal-postcard__skyline {
  opacity: 1;
}

.journal-postcard--city .journal-postcard__land--front,
.journal-postcard--skyline .journal-postcard__land--front {
  background: rgba(194, 187, 230, 0.74);
}

.journal-postcard--mountain .journal-postcard__backdrop {
  height: 108px;
  background: linear-gradient(135deg, transparent 0 28%, rgba(139, 178, 218, 0.62) 29% 56%, transparent 57%),
    linear-gradient(225deg, transparent 0 34%, rgba(176, 205, 230, 0.62) 35% 68%, transparent 69%);
}

.journal-postcard--sea {
  background: linear-gradient(145deg, #e8f7ff 0%, #d2efff 46%, #fbe8f4 100%);
}

.journal-postcard--sea .journal-postcard__land--front,
.journal-postcard--sea .journal-postcard__land--back {
  background: rgba(121, 202, 220, 0.68);
}

.journal-postcard--temple .journal-postcard__temple {
  display: block;
}

.journal-postcard--temple .journal-postcard__land--front {
  background: rgba(206, 213, 177, 0.78);
}

.journal-postcard--river .journal-postcard__river {
  left: 26%;
  width: 42%;
  transform: skewX(10deg);
}

.journal-postcard--river .journal-postcard__land--front {
  background: rgba(156, 211, 194, 0.74);
}
</style>
