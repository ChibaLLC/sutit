<script setup lang="ts">
import { descriptionHtml } from "~~/shared/utils/description";

/**
 * Renders a form description (rich HTML from the Tiptap editor).
 *
 * SAFE v-html PATTERN — do NOT bind raw user HTML directly:
 *   1. `descriptionHtml()` sanitizes with `xss` (strict whitelist, strips
 *      script/iframe/object, blocks javascript:/data: URLs).
 *   2. The server also sanitizes on write (defense in depth).
 * So `v-html="html"` below is safe. Never do `v-html="content"`.
 */
const props = defineProps<{ content: string }>();
const html = computed(() => descriptionHtml(props.content));
</script>

<template>
  <div class="form-rich-text text-muted-foreground text-sm leading-relaxed break-words" v-html="html" />
</template>
