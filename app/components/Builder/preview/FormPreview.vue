<script setup lang="ts">
  import type { FormSchema } from "~~/shared/types";

  const props = defineProps<{
    isOpen: boolean;
    form: FormSchema;
  }>();
  const emits = defineEmits(["close"]);
</script>
<template>
  <Dialog :open="isOpen" @update:open="$emit('close')">
    <DialogScrollContent class="h-full w-full max-w-full">
      <DialogHeader>
        <DialogTitle> Form Preview </DialogTitle>
      </DialogHeader>
      <div>
        <BuilderRendererFormRenderer :form="form" />
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
