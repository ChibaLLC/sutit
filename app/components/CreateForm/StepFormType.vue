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
  <div class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center">
    <div class="w-full space-y-8">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <h2 class="text-2xl font-bold tracking-tight">Choose form type</h2>
        <p class="text-muted-foreground">Select what kind of form you want to create</p>
      </div>

      <!-- Type Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          v-for="type in formTypes"
          :key="type.id"
          @click="emit('update:modelValue', type.id)"
          class="group relative flex flex-col items-start rounded-xl border-2 p-6 text-left transition-all duration-200 hover:shadow-lg"
          :class="[
            modelValue === type.id
              ? 'border-primary bg-primary/5 shadow-primary/10 shadow-md'
              : 'border-border hover:border-primary/40 bg-card',
          ]"
        >
          <!-- Selection indicator -->
          <div
            class="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
            :class="[
              modelValue === type.id ? 'border-primary bg-primary' : 'border-muted-foreground/30',
            ]"
          >
            <Check v-if="modelValue === type.id" class="text-primary-foreground h-3 w-3" />
          </div>

          <!-- Icon -->
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
            :class="[
              modelValue === type.id
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
            ]"
          >
            <component :is="type.icon" class="h-6 w-6" />
          </div>

          <!-- Content -->
          <h3 class="mb-1 text-lg font-semibold">{{ type.title }}</h3>
          <p class="text-muted-foreground mb-4 text-sm leading-relaxed">
            {{ type.description }}
          </p>

          <!-- Features -->
          <ul class="space-y-1.5">
            <li
              v-for="feature in type.features"
              :key="feature"
              class="flex items-center gap-2 text-sm"
              :class="[modelValue === type.id ? 'text-foreground' : 'text-muted-foreground']"
            >
              <div
                class="h-1.5 w-1.5 rounded-full"
                :class="[modelValue === type.id ? 'bg-primary' : 'bg-muted-foreground/40']"
              />
              {{ feature }}
            </li>
          </ul>
        </button>
      </div>
    </div>
  </div>
</template>
