<script setup lang="ts">
import { Check, ClipboardList, ShoppingBag } from "lucide-vue-next";

defineProps<{
  modelValue: "regular" | "product";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: "regular" | "product"];
}>();

const formTypes = [
  {
    id: "regular" as const,
    title: "Regular Form",
    description: "Registration, surveys, contact forms, and general data collection",
    icon: ClipboardList,
    features: ["Multi-page forms", "Conditional logic", "File uploads", "Custom fields"],
  },
  {
    id: "product" as const,
    title: "Product Form",
    description: "Sell products, collect payments, and manage inventory",
    icon: ShoppingBag,
    features: ["Product catalog", "Inventory tracking", "Payment collection", "Order management"],
  },
];
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto">
    <div class="w-full space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Choose form type</h2>
        <p class="text-muted-foreground">Select what kind of form you want to create</p>
      </div>

      <!-- Type Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="type in formTypes"
          :key="type.id"
          @click="emit('update:modelValue', type.id)"
          class="group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg"
          :class="[
            modelValue === type.id
              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
              : 'border-border hover:border-primary/40 bg-card'
          ]"
        >
          <!-- Selection indicator -->
          <div
            class="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="[
              modelValue === type.id
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/30'
            ]"
          >
            <Check v-if="modelValue === type.id" class="w-3 h-3 text-primary-foreground" />
          </div>

          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
            :class="[
              modelValue === type.id
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            ]"
          >
            <component :is="type.icon" class="w-6 h-6" />
          </div>

          <!-- Content -->
          <h3 class="text-lg font-semibold mb-1">{{ type.title }}</h3>
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            {{ type.description }}
          </p>

          <!-- Features -->
          <ul class="space-y-1.5">
            <li
              v-for="feature in type.features"
              :key="feature"
              class="flex items-center gap-2 text-sm"
              :class="[
                modelValue === type.id ? 'text-foreground' : 'text-muted-foreground'
              ]"
            >
              <div
                class="w-1.5 h-1.5 rounded-full"
                :class="[
                  modelValue === type.id ? 'bg-primary' : 'bg-muted-foreground/40'
                ]"
              />
              {{ feature }}
            </li>
          </ul>
        </button>
      </div>
    </div>
  </div>
</template>
