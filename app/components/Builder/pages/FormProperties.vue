<script setup lang="ts">
import { index } from "drizzle-orm/gel-core";
import type { FormField, PageSchema } from "~~/shared/types";

const props = defineProps<{
  selectedElement: FormField;
  currentPage: PageSchema;
}>();
const deleteElement = (index) => {
  if (props.currentPage) {
    const removed = props.currentPage.fields.splice(index, 1)[0];
    if (removed && props.selectedElement?.id === removed.id) {
      //props.selectedElement.value = null;
    }
  }
};

const deleteSelectedElement = () => {
  if (props.selectedElement && props.currentPage) {
    const index = props.currentPage.fields.findIndex(
      (el) => el.id === props.selectedElement.id,
    );
    if (index !== -1) {
      deleteElement(index);
    }
  }
};

const duplicateElement = (element) => {
  const newElement = {
    ...element,
    id: Date.now().toString(),
    label: element.label + " (Copy)",
  };

  if (props.currentPage) {
    props.currentPage.fields.push(newElement);
  }
};
const addOption = () => {
  props.selectedElement.options?.push("");
};
const removeOption = (index) => {
  props.selectedElement.options?.splice(index, 1);
};
</script>
<template>
  <div v-if="selectedElement" class="w-80 border-r bg-card/50 backdrop-blur-sm">
    <div
      class="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
    >
      <h3 class="font-semibold flex items-center gap-2">
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        Element Properties
      </h3>
      <p class="text-xs text-muted-foreground mt-1">
        Configure the selected element
      </p>
    </div>

    <div class="p-4 space-y-6 overflow-y-auto h-full">
      <!-- Basic Properties -->
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium flex items-center gap-2">
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
              ></path>
            </svg>
            Label
          </label>
          <input
            v-model="selectedElement.label"
            class="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter element label"
          />
        </div>

        <div>
          <label class="text-sm font-medium flex items-center gap-2">
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            Placeholder
          </label>
          <input
            v-model="selectedElement.placeholder"
            class="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter placeholder text"
          />
        </div>

        <!-- Advanced Properties -->
        <div class="space-y-3">
          <label
            class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <input
              v-model="selectedElement.required"
              type="checkbox"
              class="rounded border-input"
            />
            <div class="flex-1">
              <div class="text-sm font-medium">Required Field</div>
              <div class="text-xs text-muted-foreground">
                Users must fill this field
              </div>
            </div>
          </label>

          <label
            class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <input
              v-model="selectedElement.validation"
              type="checkbox"
              class="rounded border-input"
            />
            <div class="flex-1">
              <div class="text-sm font-medium">Custom Validation</div>
              <div class="text-xs text-muted-foreground">
                Add validation rules
              </div>
            </div>
          </label>
        </div>

        <!-- Options for select/radio elements -->
        <div
          v-if="
            ['select', 'radio', 'checkbox-group'].includes(selectedElement.type)
          "
          class="space-y-3"
        >
          <label class="text-sm font-medium flex items-center gap-2">
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
            </svg>
            Options
          </label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in selectedElement.options"
              :key="index"
              class="flex gap-2"
            >
              <input
                v-model="selectedElement.options[index]"
                class="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Option text"
              />
              <button
                @click="removeOption(index)"
                class="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <button
              @click="addOption()"
              class="w-full px-3 py-2 border border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              + Add Option
            </button>
          </div>
        </div>
      </div>

      <!-- Element Actions -->
      <div class="pt-4 border-t space-y-2">
        <button
          @click="duplicateElement"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
          Duplicate Element
        </button>
        <button
          @click="deleteSelectedElement"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
          Delete Element
        </button>
      </div>
    </div>
  </div>
</template>
