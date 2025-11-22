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

  const elementData = JSON.parse(
    event.dataTransfer?.getData("application/json") || "{}",
  );
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
  <div class="flex flex-col bg-background overflow-y-auto">
    <!-- Compact Page Header -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
      <div class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center"
          >
            <PencilIcon class="w-4 h-4 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <Input
              id="page-title"
              v-model="currentPage.title"
              placeholder="Page Title"
              class="h-9 border-0 bg-muted/50 focus:bg-muted transition-all duration-200 font-medium"
            />
          </div>
        </div>
        <div class="flex items-center gap-3 mt-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg flex items-center justify-center"
          >
            <TimerIcon class="w-4 h-4 text-accent-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <Textarea
              id="page-description"
              v-model="currentPage.description"
              placeholder="Page description (optional)"
              class="h-9 border-0 bg-muted/50 focus:bg-muted transition-all duration-200"
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
          class="min-h-[400px] border-2 border-dashed border-border/30 rounded-xl p-6 transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.02] relative overflow-hidden group"
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
            class="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
          ></div>

          <!-- Empty State -->
          <div
            v-if="!currentPage?.fields.length"
            class="text-center py-16 relative z-10"
          >
            <div class="relative inline-block mb-6">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse"
              ></div>
              <div
                class="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mx-auto border border-primary/20"
              >
                <FileText class="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Start Building Your Form
            </h3>
            <p
              class="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-6"
            >
              Drag and drop elements from the sidebar to create your form
            </p>
            <div
              class="flex items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <svg
                class="w-3 h-3 animate-bounce"
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
          <div v-else class="space-y-3 relative z-10">
            <div
              v-for="(element, index) in currentPage?.fields"
              :key="element.id"
              @click="$emit('selectField', element)"
              class="group cursor-pointer transform transition-all duration-200 hover:scale-[1.005]"
            >
              <Card
                :class="[
                  'relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
                  selectedElement?.id === element.id
                    ? 'border-2 border-primary bg-primary/[0.03] shadow-lg ring-2 ring-primary/20'
                    : 'border-border/40 hover:border-primary/30 bg-card hover:bg-card/80',
                ]"
              >
                <!-- Selection Indicator -->
                <div
                  v-if="selectedElement?.id === element.id"
                  class="absolute inset-0 bg-primary/[0.02] animate-pulse"
                ></div>

                <!-- Hover Gradient -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.01] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                ></div>

                <div class="relative p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5">
                        <div
                          class="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center"
                        >
                          <svg
                            class="w-3 h-3 text-primary"
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
                        <label
                          class="text-sm font-semibold text-foreground truncate"
                        >
                          {{ element.label }}
                        </label>
                        <div
                          v-if="element.required"
                          class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-medium"
                        >
                          <svg
                            class="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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
                        class="text-xs text-muted-foreground leading-relaxed"
                      >
                        {{ element.description }}
                      </p>
                    </div>

                    <button
                      @click.stop="removeElement(index)"
                      class="ml-3 p-1.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Field Preview -->
                  <div class="pointer-events-none">
                    <div
                      v-if="
                        [
                          'text',
                          'email',
                          'tel',
                          'url',
                          'phone',
                          'number',
                        ].includes(element.type)
                      "
                      class="relative"
                    >
                      <input
                        :type="element.type"
                        :placeholder="element.placeholder"
                        class="w-full px-3 py-2.5 border border-border/30 bg-muted/30 rounded-lg text-sm transition-all"
                        disabled
                      />
                      <div
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30"
                      >
                        <svg
                          class="w-3.5 h-3.5"
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
                      class="w-full px-3 py-2.5 border border-border/30 bg-muted/30 rounded-lg text-sm resize-none transition-all"
                      rows="2"
                      disabled
                    ></textarea>

                    <div v-else-if="element.type === 'select'" class="relative">
                      <select
                        class="w-full px-3 py-2.5 border border-border/30 bg-muted/30 rounded-lg text-sm transition-all appearance-none cursor-not-allowed"
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
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none"
                      >
                        <svg
                          class="w-3.5 h-3.5"
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

                    <div
                      v-else-if="element.type === 'multiselect'"
                      class="space-y-2"
                    >
                      <div
                        v-for="option in element.options"
                        :key="option"
                        class="flex items-center space-x-2 p-2 border border-border/20 rounded-md bg-muted/20"
                      >
                        <input
                          type="checkbox"
                          class="rounded border-border w-3.5 h-3.5 text-primary focus:ring-primary/20"
                          disabled
                        />
                        <label class="text-xs text-foreground font-medium">{{
                          option
                        }}</label>
                      </div>
                    </div>

                    <div v-else-if="element.type === 'radio'" class="space-y-2">
                      <div
                        v-for="option in element.options"
                        :key="option"
                        class="flex items-center space-x-2 p-2 border border-border/20 rounded-md bg-muted/20"
                      >
                        <input
                          type="radio"
                          :name="element.id"
                          class="border-border w-3.5 h-3.5 text-primary focus:ring-primary/20"
                          disabled
                        />
                        <label class="text-xs text-foreground font-medium">{{
                          option
                        }}</label>
                      </div>
                    </div>

                    <div
                      v-else-if="element.type === 'checkbox'"
                      class="flex items-center space-x-2 p-2.5 border border-border/20 rounded-md bg-muted/20"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-border w-3.5 h-3.5 text-primary focus:ring-primary/20"
                        disabled
                      />
                      <label class="text-xs text-foreground font-medium">{{
                        element.placeholder
                      }}</label>
                    </div>

                    <div v-else-if="element.type === 'file'" class="relative">
                      <input
                        type="file"
                        class="w-full px-3 py-2.5 border border-border/30 bg-muted/30 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-not-allowed text-xs"
                        disabled
                      />
                    </div>

                    <div v-else-if="element.type === 'date'" class="relative">
                      <input
                        type="date"
                        class="w-full px-3 py-2.5 border border-border/30 bg-muted/30 rounded-lg text-sm transition-all cursor-not-allowed"
                        disabled
                      />
                    </div>

                    <div
                      v-else-if="element.type == 'toggle'"
                      class="flex items-center"
                    >
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
