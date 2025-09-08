<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  Moon,
  Sun,
  Upload,
} from "lucide-vue-next";

const props = defineProps<{
  previewMode: boolean;
  isDark: boolean;
}>();
const emits = defineEmits([
  "toggleTheme",
  "exit",
  "preview",
  "import",
  "export",
]);
</script>
<template>
  <header
    class="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50"
  >
    <div class="container flex h-16 items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="$emit('exit')" class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Back
        </Button>
        <Separator orientation="vertical" class="h-6" />
        <h1 class="text-xl font-semibold">Form Builder</h1>
      </div>

      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          @click="$emit('toggleTheme')"
          class="gap-2"
        >
          <Sun v-if="isDark" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </Button>
        <Button @click="$emit('import')">
          <Upload class="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button @click="$emit('export')">
          <Download class="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button
          :variant="previewMode ? 'default' : 'secondary'"
          size="sm"
          @click="$emit('preview')"
          class="gap-2"
        >
          <Eye v-if="!previewMode" class="h-4 w-4" />
          <Edit v-else class="h-4 w-4" />
          {{ previewMode ? "Edit" : "Preview" }}
        </Button>
      </div>
    </div>
  </header>
</template>
