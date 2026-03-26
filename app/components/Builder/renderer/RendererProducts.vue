<script setup lang="ts">
import { computed } from "vue";
import { Package, Plus, Minus, ShoppingCart } from "lucide-vue-next";
import type { Store } from "~~/shared/types";

const props = defineProps<{
  stores: Store[];
  selected: Record<string, { quantity: number; storeId: string }>;
}>();

const emit = defineEmits<{
  "update:selected": [value: Record<string, { quantity: number; storeId: string }>];
}>();

const qty = (productId: string) => props.selected[productId]?.quantity ?? 0;

const changeQty = (productId: string, storeId: string, delta: number) => {
  const next = { ...props.selected };
  const current = next[productId]?.quantity ?? 0;
  const newQty = current + delta;
  if (newQty <= 0) {
    delete next[productId];
  } else {
    next[productId] = { quantity: newQty, storeId };
  }
  emit("update:selected", next);
};

const totalItems = computed(() =>
  Object.values(props.selected).reduce((s, i) => s + i.quantity, 0),
);

const totalPrice = computed(() => {
  let total = 0;
  for (const [id, data] of Object.entries(props.selected)) {
    for (const store of props.stores) {
      const product = store.items.find((p) => p.id === id);
      if (product) total += Number(product.price) * data.quantity;
    }
  }
  return total;
});
</script>

<template>
  <div class="space-y-4">
    <div v-for="store in stores" :key="store.id" class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Card
          v-for="product in store.items"
          :key="product.id"
          class="group overflow-hidden transition-all hover:shadow-md p-0"
          :class="qty(product.id) > 0 ? 'border-primary/50 ring-1 ring-primary/20' : ''"
        >
          <div class="aspect-square relative overflow-hidden bg-muted">
            <NuxtImg
              v-if="product.images?.length"
              :src="product.images[0]"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <Package class="w-12 h-12 text-muted-foreground/50" />
            </div>
            <div
              v-if="qty(product.id) > 0"
              class="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {{ qty(product.id) }}
            </div>
          </div>
          <CardContent class="p-3 space-y-2">
            <div class="min-h-10">
              <h4 class="font-medium text-sm leading-tight line-clamp-2">
                {{ product.name }}
              </h4>
            </div>
            <p v-if="product.description" class="text-xs text-muted-foreground line-clamp-1">
              {{ product.description }}
            </p>
            <div class="flex items-center justify-between gap-2 pt-1">
              <span class="font-semibold text-sm text-primary"
                >KES {{ Number(product.price).toLocaleString() }}</span
              >
              <div class="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  class="h-7 w-7"
                  @click="changeQty(product.id, store.id.toString(), -1)"
                  :disabled="qty(product.id) === 0"
                >
                  <Minus class="w-3 h-3" />
                </Button>
                <span class="w-6 text-center text-xs font-medium">{{ qty(product.id) }}</span>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-7 w-7"
                  @click="changeQty(product.id, store.id.toString(), 1)"
                >
                  <Plus class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Floating summary -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <Card
        v-if="totalItems > 0"
        class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-background/95 backdrop-blur-sm border-primary/30 shadow-lg"
      >
        <CardContent class="p-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingCart class="w-5 h-5 text-primary" />
            </div>
            <div>
              <span class="font-medium text-sm"
                >{{ totalItems }} item{{ totalItems !== 1 ? "s" : "" }}</span
              >
              <p class="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          <span class="font-bold text-lg text-primary">KES {{ totalPrice.toLocaleString() }}</span>
        </CardContent>
      </Card>
    </Transition>
  </div>
</template>
