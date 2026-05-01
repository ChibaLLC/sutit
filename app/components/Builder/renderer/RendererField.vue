<script setup lang="ts">
  import { X, Upload } from "lucide-vue-next";
  import { ref } from "vue";
  import { toast } from "vue-sonner";
  import type { FormField } from "~~/shared/types";

  const props = defineProps<{
    field: FormField;
    modelValue: any;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: any];
  }>();

  const uploading = ref(false);

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading.value = true;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await $fetch("/api/uploads", { method: "POST", body: fd });
      emit("update:modelValue", (data as any)?.path ?? file.name);
    } catch {
      toast.error("Upload failed");
    } finally {
      uploading.value = false;
    }
  };

  const toggleMultiselect = (option: string) => {
    const current: string[] = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = current.indexOf(option);
    if (idx > -1) current.splice(idx, 1);
    else current.push(option);
    emit("update:modelValue", current);
  };

  const hasOption = (option: string) =>
    Array.isArray(props.modelValue) && props.modelValue.includes(option);
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <div class="flex items-center gap-2">
      <Label :for="field.id" class="text-sm font-medium">{{ field.label }}</Label>
      <span v-if="field.required" class="text-destructive text-[10px] font-semibold">Required</span>
    </div>
    <p v-if="field.description" class="text-muted-foreground text-xs">{{ field.description }}</p>

    <!-- Text / Email / Phone / URL / Number -->
    <Input
      v-if="['text', 'email', 'phone', 'url', 'number'].includes(field.type)"
      :id="field.id"
      :type="field.type === 'phone' ? 'tel' : field.type"
      :model-value="modelValue ?? ''"
      @update:model-value="emit('update:modelValue', $event)"
      :placeholder="field.placeholder"
      :required="field.required"
      class="h-11"
    />

    <!-- Textarea -->
    <Textarea
      v-else-if="field.type === 'textarea'"
      :id="field.id"
      :model-value="modelValue ?? ''"
      @update:model-value="emit('update:modelValue', $event)"
      :placeholder="field.placeholder"
      :required="field.required"
      rows="4"
      class="resize-none"
    />

    <!-- Date -->
    <Input
      v-else-if="field.type === 'date'"
      :id="field.id"
      type="date"
      :model-value="modelValue ?? ''"
      @update:model-value="emit('update:modelValue', $event)"
      :required="field.required"
      class="h-11"
    />

    <!-- Select -->
    <Select
      v-else-if="field.type === 'select'"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <SelectTrigger :id="field.id" class="h-11">
        <SelectValue :placeholder="field.placeholder || 'Select an option'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</SelectItem>
      </SelectContent>
    </Select>

    <!-- Radio -->
    <RadioGroup
      v-else-if="field.type === 'radio'"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      class="space-y-2"
    >
      <div
        v-for="opt in field.options"
        :key="opt"
        class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
        @click="emit('update:modelValue', opt)"
      >
        <RadioGroupItem :value="opt" class="pointer-events-none" />
        <Label class="flex-1 cursor-pointer text-sm">{{ opt }}</Label>
      </div>
    </RadioGroup>

    <!-- Multiselect -->
    <div v-else-if="field.type === 'multiselect'" class="space-y-2">
      <div
        v-for="opt in field.options"
        :key="opt"
        class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
        @click="toggleMultiselect(opt)"
      >
        <Checkbox :model-value="hasOption(opt)" class="pointer-events-none" />
        <Label class="flex-1 cursor-pointer text-sm">{{ opt }}</Label>
      </div>
      <p v-if="(modelValue ?? []).length" class="text-primary text-xs font-medium">
        {{ (modelValue ?? []).length }} selected
      </p>
    </div>

    <!-- Checkbox -->
    <div
      v-else-if="field.type === 'checkbox'"
      class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
      @click="emit('update:modelValue', !modelValue)"
    >
      <Checkbox :model-value="!!modelValue" class="pointer-events-none" />
      <Label class="flex-1 cursor-pointer text-sm">{{ field.placeholder || "I agree" }}</Label>
    </div>

    <!-- Toggle -->
    <div
      v-else-if="field.type === 'toggle'"
      class="flex items-center justify-between rounded-lg border p-3"
    >
      <Label class="text-sm">{{ field.placeholder || field.label }}</Label>
      <Switch :model-value="!!modelValue" @update:model-value="emit('update:modelValue', $event)" />
    </div>

    <!-- File -->
    <div v-else-if="field.type === 'file'" class="space-y-2">
      <label
        :for="field.id"
        class="hover:border-primary/50 hover:bg-primary/5 flex h-20 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
      >
        <Upload class="text-muted-foreground h-5 w-5" />
        <span class="text-muted-foreground text-sm">
          {{ uploading ? "Uploading..." : "Click to upload a file" }}
        </span>
      </label>
      <input
        :id="field.id"
        type="file"
        class="sr-only"
        @change="handleFileUpload"
        :required="field.required"
      />
      <div v-if="modelValue" class="bg-muted flex items-center gap-2 rounded-lg p-2 text-sm">
        <span class="flex-1 truncate">{{ modelValue }}</span>
        <Button
          variant="ghost"
          size="sm"
          class="h-6 w-6 p-0"
          @click="emit('update:modelValue', null)"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </div>
</template>
