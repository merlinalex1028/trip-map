<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  tags: string[]
  maxTags?: number
  maxTagLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 10,
  maxTagLength: 20,
})

const emit = defineEmits<{
  'update:tags': [tags: string[]]
}>()

const inputValue = ref('')

const isAtLimit = props.tags.length >= props.maxTags

function addTag(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return
  if (props.tags.includes(trimmed)) return
  if (props.tags.length >= props.maxTags) return
  if (trimmed.length > props.maxTagLength) return

  emit('update:tags', [...props.tags, trimmed])
  inputValue.value = ''
}

function removeTag(index: number) {
  const next = props.tags.filter((_, i) => i !== index)
  emit('update:tags', next)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag(inputValue.value)
  }
  if (event.key === 'Backspace' && inputValue.value === '' && props.tags.length > 0) {
    removeTag(props.tags.length - 1)
  }
}

function handleBlur() {
  if (inputValue.value.trim()) {
    addTag(inputValue.value)
  }
}
</script>

<template>
  <div
    class="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-[#d7dcea] bg-white p-2"
    data-region="tag-input"
  >
    <span
      v-for="(tag, index) in tags"
      :key="tag"
      class="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/30 px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
      data-tag-chip
    >
      {{ tag }}
      <button
        type="button"
        class="ml-1 text-[var(--color-ink-soft)] hover:text-[var(--color-destructive)]"
        data-tag-remove
        :aria-label="`删除标签 ${tag}`"
        @click="removeTag(index)"
      >
        ×
      </button>
    </span>
    <input
      v-model="inputValue"
      type="text"
      class="min-w-[80px] flex-1 bg-transparent text-[var(--font-label-size)] text-[var(--color-ink-strong)] outline-none"
      :placeholder="tags.length >= maxTags ? `最多添加 ${maxTags} 个标签` : '输入标签，按回车添加'"
      :disabled="tags.length >= maxTags"
      data-tag-input-field
      aria-label="输入标签"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />
  </div>
</template>
