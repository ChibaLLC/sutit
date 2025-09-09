<script setup lang="ts">
import { FileText, X } from "lucide-vue-next";
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
  <div class="h-full flex flex-col bg-background">
    <div
      class="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm"
    >
      <div class="px-6 py-4">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4">
            <Label for="page-title" class="text-sm font-medium text-foreground"
              >Page Title</Label
            >
            <Input
              id="page-title"
              v-model="currentPage.title"
              placeholder="Enter page title"
              class="mt-1"
            />
          </div>
          <div class="col-span-8">
            <Label
              for="page-description"
              class="text-sm font-medium text-foreground"
              >Description</Label
            >
            <Textarea
              id="page-description"
              v-model="currentPage.description"
              placeholder="Enter page description (optional)"
              rows="2"
              class="mt-1 resize-none"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div class="p-6">
        <div
          @drop="onDrop"
          @dragover.prevent
          @dragenter.prevent
          class="min-h-[500px] border-2 border-dashed border-border/60 rounded-xl p-8 transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 relative overflow-hidden"
          :class="{ 'border-primary bg-primary/10 shadow-lg': false }"
        >
          <div v-if="!currentPage?.fields.length" class="text-center py-16">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl opacity-30"
              ></div>
              <FileText
                class="relative w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-60"
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Start Building Your Form
            </h3>
            <p
              class="text-muted-foreground text-base max-w-md mx-auto leading-relaxed"
            >
              Drag and drop elements from the sidebar to create your form. Build
              beautiful, interactive forms with ease.
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(element, index) in currentPage?.fields"
              :key="element.id"
              @click="$emit('selectField', element)"
              :class="[
                'group p-5 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                selectedElement?.id === element.id
                  ? 'border-primary bg-primary/8 shadow-lg ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40 bg-card/50 hover:bg-card',
              ]"
            >
              <div class="flex items-center justify-between mb-3">
                <label
                  class="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  {{ element.label }}
                  <span v-if="element.required" class="text-destructive text-xs"
                    >*</span
                  >
                </label>
                <button
                  @click.stop="removeElement(index)"
                  class="opacity-0 group-hover:opacity-100 p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="pointer-events-none">
                <input
                  v-if="
                    ['text', 'email', 'tel', 'url', 'phone', 'number'].includes(
                      element.type,
                    )
                  "
                  :type="element.type"
                  :placeholder="element.placeholder"
                  class="w-full px-4 py-3 border border-input bg-background/80 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled
                />
                <textarea
                  v-else-if="element.type === 'textarea'"
                  :placeholder="element.placeholder"
                  class="w-full px-4 py-3 border border-input bg-background/80 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  rows="3"
                  disabled
                ></textarea>
                <select
                  v-else-if="element.type === 'select'"
                  class="w-full px-4 py-3 border border-input bg-background/80 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
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
                  v-else-if="element.type === 'multiselect'"
                  class="space-y-3"
                >
                  <div
                    v-for="option in element.options"
                    :key="option"
                    class="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      class="rounded border-input w-4 h-4 text-primary focus:ring-primary/20"
                      disabled
                    />
                    <label class="text-sm text-foreground font-medium">{{
                      option
                    }}</label>
                  </div>
                </div>
                <div v-else-if="element.type === 'radio'" class="space-y-3">
                  <div
                    v-for="option in element.options"
                    :key="option"
                    class="flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      :name="element.id"
                      class="border-input w-4 h-4 text-primary focus:ring-primary/20"
                      disabled
                    />
                    <label class="text-sm text-foreground font-medium">{{
                      option
                    }}</label>
                  </div>
                </div>
                <div
                  v-else-if="element.type === 'checkbox'"
                  class="flex items-center space-x-3"
                >
                  <input
                    type="checkbox"
                    class="rounded border-input w-4 h-4 text-primary focus:ring-primary/20"
                    disabled
                  />
                  <label class="text-sm text-foreground font-medium">{{
                    element.label
                  }}</label>
                </div>
                <input
                  v-else-if="element.type === 'file'"
                  type="file"
                  class="w-full px-4 py-3 border border-input bg-background/80 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                  disabled
                />
                <input
                  v-else-if="element.type === 'date'"
                  type="date"
                  class="w-full px-4 py-3 border border-input bg-background/80 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
