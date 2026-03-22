<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Banknote, Gift } from "lucide-vue-next";

const props = defineProps<{
  isPaid: boolean;
  price: number;
  formType: "regular" | "product";
}>();

const emit = defineEmits<{
  "update:isPaid": [value: boolean];
  "update:price": [value: number];
}>();

const localPrice = ref(props.price);
watch(() => props.price, (v) => { localPrice.value = v; });

const flushPrice = () => {
  const val = parseFloat(String(localPrice.value));
  const parsed = isNaN(val) ? 0 : Math.max(0, val);
  if (parsed !== props.price) emit("update:price", parsed);
};

const pricingOptions = computed(() => [
  {
    id: "free",
    title: "Free",
    description: props.formType === "product"
      ? "Let users browse products without a submission fee"
      : "No charge for submissions",
    icon: Gift,
  },
  {
    id: "paid",
    title: "Paid",
    description: props.formType === "product"
      ? "Charge a base fee on top of product prices"
      : "Charge a fee for each submission",
    icon: Banknote,
  },
]);
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto">
    <div class="w-full space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Set pricing</h2>
        <p class="text-muted-foreground">
          {{ formType === "product"
            ? "Choose if you want to charge a submission fee"
            : "Decide if this form is free or paid"
          }}
        </p>
      </div>

      <!-- Pricing Toggle -->
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="option in pricingOptions"
          :key="option.id"
          @click="emit('update:isPaid', option.id === 'paid')"
          class="group relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-lg"
          :class="[
            (option.id === 'paid') === isPaid
              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
              : 'border-border hover:border-primary/40 bg-card'
          ]"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
            :class="[
              (option.id === 'paid') === isPaid
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            ]"
          >
            <component :is="option.icon" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-semibold mb-1">{{ option.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ option.description }}
          </p>
        </button>
      </div>

      <!-- Price Input (shown when paid) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="isPaid" class="space-y-3">
          <Label for="price" class="text-sm font-medium">Amount (KES)</Label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              KES
            </span>
            <Input
              id="price"
              type="number"
              v-model.number="localPrice"
              @blur="flushPrice"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="h-12 text-lg pl-14 pr-4"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ formType === "product"
              ? "This is the base submission fee. Product prices are set separately in the store."
              : "Users will be charged this amount per submission."
            }}
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>
