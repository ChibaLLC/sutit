<script setup lang="ts">
  import { Link2, Pencil, Sparkles } from "lucide-vue-next";
  import { ref, watch } from "vue";

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

  watch(
    () => props.name,
    (v) => {
      localName.value = v;
    },
  );
  watch(
    () => props.slug,
    (v) => {
      localSlug.value = v;
    },
  );
  watch(
    () => props.description,
    (v) => {
      localDescription.value = v;
    },
  );

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
  <div class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center">
    <div class="w-full space-y-8">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <div
          class="bg-primary/10 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Sparkles class="text-primary h-6 w-6" />
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
          class="h-12 px-4 text-lg"
          autofocus
        />
      </div>

      <!-- Slug Preview -->
      <div class="space-y-2">
        <Label class="flex items-center gap-2 text-sm font-medium">
          <Link2 class="h-4 w-4" />
          URL slug
        </Label>
        <div class="flex items-center gap-2">
          <div
            class="border-input bg-muted/30 flex h-10 flex-1 items-center rounded-md border px-3 text-sm"
          >
            <span class="text-muted-foreground">/forms/</span>
            <template v-if="!isEditingSlug">
              <span class="text-foreground font-medium">{{ slug || "your-form-slug" }}</span>
            </template>
            <template v-else>
              <input
                v-model="localSlug"
                @keydown.enter="
                  isEditingSlug = false;
                  flushSlug();
                "
                @blur="
                  isEditingSlug = false;
                  flushSlug();
                "
                class="text-foreground min-w-0 flex-1 bg-transparent font-medium outline-none"
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
            <Pencil class="h-4 w-4" />
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
        <p v-if="slug" class="text-muted-foreground text-xs">
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
