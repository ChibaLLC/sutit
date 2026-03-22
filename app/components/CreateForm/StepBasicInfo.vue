<script setup lang="ts">
import { ref, watch } from "vue";
import { Link2, Pencil, Sparkles } from "lucide-vue-next";

const props = defineProps<{
  name: string;
  slug: string;
  description: string;
}>();

const emit = defineEmits<{
  "update:name": [value: string];
  "update:slug": [value: string];
  "update:description": [value: string];
}>();

const isSlugManuallyEdited = ref(false);
const isEditingSlug = ref(false);

const localName = ref(props.name);
const localSlug = ref(props.slug);
const localDescription = ref(props.description);

watch(() => props.name, (v) => { localName.value = v; });
watch(() => props.slug, (v) => { localSlug.value = v; });
watch(() => props.description, (v) => { localDescription.value = v; });

const slugify = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const flushName = () => {
  if (localName.value !== props.name) {
    emit("update:name", localName.value);
    if (!isSlugManuallyEdited.value) {
      const slug = slugify(localName.value);
      localSlug.value = slug;
      emit("update:slug", slug);
    }
  }
};

const flushSlug = () => {
  const slug = slugify(localSlug.value);
  localSlug.value = slug;
  emit("update:slug", slug);
  isSlugManuallyEdited.value = true;
};

const flushDescription = () => {
  if (localDescription.value !== props.description) {
    emit("update:description", localDescription.value);
  }
};

const resetSlug = () => {
  isSlugManuallyEdited.value = false;
  const slug = slugify(localName.value);
  localSlug.value = slug;
  emit("update:slug", slug);
  isEditingSlug.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto">
    <div class="w-full space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
          <Sparkles class="w-6 h-6 text-primary" />
        </div>
        <h2 class="text-2xl font-bold tracking-tight">Name your form</h2>
        <p class="text-muted-foreground">Give your form a clear, descriptive name</p>
      </div>

      <!-- Form Name Input -->
      <div class="space-y-2">
        <Label for="form-name" class="text-sm font-medium">Form name</Label>
        <Input
          id="form-name"
          v-model="localName"
          @blur="flushName"
          placeholder="e.g. Event Registration, Customer Survey"
          class="h-12 text-lg px-4"
          autofocus
        />
      </div>

      <!-- Slug Preview -->
      <div class="space-y-2">
        <Label class="text-sm font-medium flex items-center gap-2">
          <Link2 class="w-4 h-4" />
          URL slug
        </Label>
        <div class="flex items-center gap-2">
          <div class="flex-1 flex items-center h-10 rounded-md border border-input bg-muted/30 px-3 text-sm">
            <span class="text-muted-foreground">/forms/</span>
            <template v-if="!isEditingSlug">
              <span class="font-medium text-foreground">{{ slug || "your-form-slug" }}</span>
            </template>
            <template v-else>
              <input
                v-model="localSlug"
                @keydown.enter="isEditingSlug = false; flushSlug()"
                @blur="isEditingSlug = false; flushSlug()"
                class="bg-transparent outline-none font-medium text-foreground flex-1 min-w-0"
                autofocus
              />
            </template>
          </div>
          <Button
            v-if="!isEditingSlug"
            variant="ghost"
            size="sm"
            @click="isEditingSlug = true"
            class="shrink-0"
          >
            <Pencil class="w-4 h-4" />
          </Button>
          <Button
            v-if="isSlugManuallyEdited"
            variant="ghost"
            size="sm"
            @click="resetSlug"
            class="shrink-0 text-xs"
          >
            Reset
          </Button>
        </div>
        <p v-if="slug" class="text-xs text-muted-foreground">
          Your form will be accessible at <span class="font-mono">/forms/{{ slug }}</span>
        </p>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <Label for="form-description" class="text-sm font-medium">
          Description <span class="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="form-description"
          v-model="localDescription"
          @blur="flushDescription"
          placeholder="Brief description of what this form is for..."
          rows="3"
          class="resize-none"
        />
      </div>
    </div>
  </div>
</template>
