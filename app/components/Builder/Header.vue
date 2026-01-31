<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  Moon,
  SaveIcon,
  Sun,
  Upload,
  Loader,
  AlertCircle,
} from "lucide-vue-next";
import type { FormSchema } from "~~/shared/types";

const props = defineProps<{
  previewMode: boolean;
  isDark: boolean;
  isSubmitting?: boolean;
  validationErrors?: { field: string; message: string }[];
}>();
const emits = defineEmits<{
  publish: [];
  toggleTheme: [];
  "go-back": [];
  preview: [];
  import: [];
  export: [];
}>();
</script>
<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-14 items-center justify-between px-4">
      <!-- Left Section -->
      <div class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('go-back')"
          class="h-9 w-9 p-0"
        >
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" class="h-5" />
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold">Form Builder</h1>
            <p class="text-xs text-muted-foreground">Create beautiful forms</p>
          </div>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('toggleTheme')"
          class="h-9 w-9 p-0"
        >
          <Sun v-if="isDark" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </Button>

        <!-- Actions Group -->
        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            @click="$emit('import')"
            class="h-9 px-3"
          >
            <Upload class="h-4 w-4" />
            <span class="ml-2 hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="$emit('export')"
            class="h-9 px-3"
          >
            <Download class="h-4 w-4" />
            <span class="ml-2 hidden sm:inline">Export</span>
          </Button>
        </div>

        <Separator orientation="vertical" class="h-5" />

        <!-- Validation Warning -->
        <div
          v-if="validationErrors && validationErrors.length > 0"
          class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm"
        >
          <AlertCircle class="h-4 w-4" />
          <span>{{ validationErrors.length }} error(s)</span>
        </div>

        <!-- Preview Toggle -->
        <Button
          :variant="previewMode ? 'default' : 'secondary'"
          size="sm"
          @click="$emit('preview')"
          :disabled="isSubmitting"
          class="h-9 px-3"
        >
          <Eye v-if="!previewMode" class="h-4 w-4" />
          <Edit v-else class="h-4 w-4" />
          <span class="ml-2 hidden sm:inline">
            {{ previewMode ? "Edit" : "Preview" }}
          </span>
        </Button>

        <!-- Publish Button -->
        <Button
          size="sm"
          @click.prevent="$emit('publish')"
          :disabled="isSubmitting"
          class="h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200"
        >
          <Loader v-if="isSubmitting" class="h-4 w-4 animate-spin" />
          <SaveIcon v-else class="h-4 w-4" />
          <span class="ml-2 hidden sm:inline">
            {{ isSubmitting ? "Publishing..." : "Publish" }}
          </span>
        </Button>
      </div>
    </div>
  </header>
</template>
