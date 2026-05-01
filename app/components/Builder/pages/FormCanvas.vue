<script setup lang="ts">
  import { FileText, PencilIcon, TimerIcon, X } from "lucide-vue-next";
  import type { FormField, PageSchema } from "~~/shared/types";

  const props = defineProps<{
    selectedElement: FormField;
    currentPage: PageSchema;
  }>();

  const emits = defineEmits<{
    selectField: [field: FormField | null];
  }>();

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const elementData = JSON.parse(event.dataTransfer?.getData("application/json") || "{}");
    let unique = Date.now().toString();
    const newElement: FormField = {
      id: Date.now().toString(),
      type: elementData.type,
      label: elementData.label,
      placeholder: `Enter ${elementData.label.toLowerCase()}`,
      required: false,
      options: ["select", "multiselect", "radio"].includes(elementData.type)
        ? ["Option 1", "Option 2"]
        : undefined,
      orderIndex: props.currentPage.fields.length + 1,
      name: unique,
    };

    if (props.currentPage) {
      props.currentPage.fields.push(newElement);
      emits("selectField", newElement);
    }
  };
  const removeElement = (index: number) => {
    if (props.currentPage) {
      const removed = props.currentPage.fields.splice(index, 1)[0];
      if (removed && props.selectedElement?.id === removed.id) {
        emits("selectField", null);
      }
    }
  };
</script>
<template>
  <div class="bg-background flex flex-col overflow-y-auto">
    <!-- Compact Page Header -->
    <div class="bg-background/95 sticky top-0 z-20 border-b backdrop-blur-sm">
      <div class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="from-primary/10 to-primary/5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br"
          >
            <PencilIcon class="text-primary h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <Input
              id="page-title"
              v-model="currentPage.title"
              placeholder="Page Title"
              class="bg-muted/50 focus:bg-muted h-9 border-0 font-medium transition-all duration-200"
            />
          </div>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <div
            class="from-accent/10 to-accent/5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br"
          >
            <TimerIcon class="text-accent-foreground h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <Textarea
              id="page-description"
              v-model="currentPage.description"
              placeholder="Page description (optional)"
              class="bg-muted/50 focus:bg-muted h-9 border-0 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Canvas -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <div
          @drop="onDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-border/30 hover:border-primary/40 hover:bg-primary/[0.02] group relative min-h-[400px] overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all duration-300"
          :class="{ 'border-primary bg-primary/[0.05] shadow-lg': false }"
        >
          <!-- Subtle Background Pattern -->
          <div class="absolute inset-0 opacity-3">
            <div
              class="absolute inset-0"
              style="
                background-image: radial-gradient(
                  circle at 2px 2px,
                  rgb(148 163 184) 1px,
                  transparent 1px
                );
                background-size: 24px 24px;
              "
            ></div>
          </div>

          <!-- Drop Zone Overlay -->
          <div
            class="from-primary/3 to-accent/3 absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          ></div>

          <!-- Empty State -->
          <div v-if="!currentPage?.fields.length" class="relative z-10 py-16 text-center">
            <div class="relative mb-6 inline-block">
              <div
                class="from-primary/20 to-accent/20 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r blur-2xl"
              ></div>
              <div
                class="from-primary/10 to-accent/10 border-primary/20 relative mx-auto flex h-16 w-16 items-center justify-center rounded-xl border bg-gradient-to-br"
              >
                <FileText class="text-primary h-8 w-8" />
              </div>
            </div>
            <h3 class="text-foreground mb-3 text-xl font-semibold">Start Building Your Form</h3>
            <p class="text-muted-foreground mx-auto mb-6 max-w-md text-sm leading-relaxed">
              Drag and drop elements from the sidebar to create your form
            </p>
            <div class="text-muted-foreground flex items-center justify-center gap-2 text-xs">
              <svg
                class="h-3 w-3 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span>Drag elements here to get started</span>
            </div>
          </div>

          <!-- Form Elements -->
          <div v-else class="relative z-10 space-y-3">
            <div
              v-for="(element, index) in currentPage?.fields"
              :key="element.id"
              @click="$emit('selectField', element)"
              class="group transform cursor-pointer transition-all duration-200 hover:scale-[1.005]"
            >
              <Card
                :class="[
                  'relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                  selectedElement?.id === element.id
                    ? 'border-primary bg-primary/[0.03] ring-primary/20 border-2 shadow-lg ring-2'
                    : 'border-border/40 hover:border-primary/30 bg-card hover:bg-card/80',
                ]"
              >
                <!-- Selection Indicator -->
                <div
                  v-if="selectedElement?.id === element.id"
                  class="bg-primary/[0.02] absolute inset-0 animate-pulse"
                ></div>

                <!-- Hover Gradient -->
                <div
                  class="via-primary/[0.01] absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full"
                ></div>

                <div class="relative p-4">
                  <div class="mb-3 flex items-start justify-between">
                    <div class="min-w-0 flex-1">
                      <div class="mb-1.5 flex items-center gap-2">
                        <div
                          class="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-md"
                        >
                          <svg
                            class="text-primary h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <label class="text-foreground truncate text-sm font-semibold">
                          {{ element.label }}
                        </label>
                        <div
                          v-if="element.required"
                          class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600"
                        >
                          <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          Required
                        </div>
                      </div>
                      <p
                        v-if="element.description"
                        class="text-muted-foreground text-xs leading-relaxed"
                      >
                        {{ element.description }}
                      </p>
                    </div>

                    <button
                      @click.stop="removeElement(index)"
                      class="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 ml-3 rounded-md p-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110"
                    >
                      <X class="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <!-- Field Preview -->
                  <div class="pointer-events-none">
                    <div
                      v-if="
                        ['text', 'email', 'tel', 'url', 'phone', 'number'].includes(element.type)
                      "
                      class="relative"
                    >
                      <input
                        :type="element.type"
                        :placeholder="element.placeholder"
                        class="border-border/30 bg-muted/30 w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                        disabled
                      />
                      <div
                        class="text-muted-foreground/30 absolute top-1/2 right-2.5 -translate-y-1/2"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                    </div>

                    <textarea
                      v-else-if="element.type === 'textarea'"
                      :placeholder="element.placeholder"
                      class="border-border/30 bg-muted/30 w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-all"
                      rows="2"
                      disabled
                    ></textarea>

                    <div v-else-if="element.type === 'select'" class="relative">
                      <select
                        class="border-border/30 bg-muted/30 w-full cursor-not-allowed appearance-none rounded-lg border px-3 py-2.5 text-sm transition-all"
                        disabled
                      >
                        <option>
                          {{ element.placeholder || "Select an option" }}
                        </option>
                        <option v-for="option in element.options" :key="option">
                          {{ option }}
                        </option>
                      </select>
                      <div
                        class="text-muted-foreground/30 pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    <div v-else-if="element.type === 'multiselect'" class="space-y-2">
                      <div
                        v-for="option in element.options"
                        :key="option"
                        class="border-border/20 bg-muted/20 flex items-center space-x-2 rounded-md border p-2"
                      >
                        <input
                          type="checkbox"
                          class="border-border text-primary focus:ring-primary/20 h-3.5 w-3.5 rounded"
                          disabled
                        />
                        <label class="text-foreground text-xs font-medium">{{ option }}</label>
                      </div>
                    </div>

                    <div v-else-if="element.type === 'radio'" class="space-y-2">
                      <div
                        v-for="option in element.options"
                        :key="option"
                        class="border-border/20 bg-muted/20 flex items-center space-x-2 rounded-md border p-2"
                      >
                        <input
                          type="radio"
                          :name="element.id"
                          class="border-border text-primary focus:ring-primary/20 h-3.5 w-3.5"
                          disabled
                        />
                        <label class="text-foreground text-xs font-medium">{{ option }}</label>
                      </div>
                    </div>

                    <div
                      v-else-if="element.type === 'checkbox'"
                      class="border-border/20 bg-muted/20 flex items-center space-x-2 rounded-md border p-2.5"
                    >
                      <input
                        type="checkbox"
                        class="border-border text-primary focus:ring-primary/20 h-3.5 w-3.5 rounded"
                        disabled
                      />
                      <label class="text-foreground text-xs font-medium">{{
                        element.placeholder
                      }}</label>
                    </div>

                    <div v-else-if="element.type === 'file'" class="relative">
                      <input
                        type="file"
                        class="border-border/30 bg-muted/30 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full cursor-not-allowed rounded-lg border px-3 py-2.5 text-sm text-xs transition-all file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5"
                        disabled
                      />
                    </div>

                    <div v-else-if="element.type === 'date'" class="relative">
                      <input
                        type="date"
                        class="border-border/30 bg-muted/30 w-full cursor-not-allowed rounded-lg border px-3 py-2.5 text-sm transition-all"
                        disabled
                      />
                    </div>

                    <div v-else-if="element.type == 'toggle'" class="flex items-center">
                      <Switch disabled class="scale-75" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
