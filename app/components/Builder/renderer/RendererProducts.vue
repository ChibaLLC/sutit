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
  Object.values(props.selected).reduce((s, i) => s + i.quantity, 0)
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
  <div class="space-y-8">
    <div v-for="store in stores" :key="store.id" class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package class="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 class="font-semibold">{{ store.name }}</h3>
          <p v-if="store.description" class="text-sm text-muted-foreground">{{ store.description }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card
          v-for="product in store.items"
          :key="product.id"
          class="transition-all"
          :class="qty(product.id) > 0 ? 'border-primary/40 shadow-sm' : ''"
        >
          <CardContent class="p-4">
            <div class="flex items-start gap-3">
              <div class="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <img
                  v-if="product.images?.length"
                  :src="product.images[0]"
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
                <Package v-else class="w-6 h-6 text-muted-foreground" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm">{{ product.name }}</h4>
                <p v-if="product.description" class="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {{ product.description }}
                </p>
                <div class="flex items-center justify-between mt-3">
                  <span class="font-semibold text-sm">KES {{ Number(product.price).toLocaleString() }}</span>
                  <div class="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      class="h-7 w-7 p-0"
                      @click="changeQty(product.id, store.id.toString(), -1)"
                      :disabled="qty(product.id) === 0"
                    >
                      <Minus class="w-3 h-3" />
                    </Button>
                    <span class="w-8 text-center text-sm font-medium">{{ qty(product.id) }}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      class="h-7 w-7 p-0"
                      @click="changeQty(product.id, store.id.toString(), 1)"
                    >
                      <Plus class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
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
      <Card v-if="totalItems > 0" class="bg-primary/5 border-primary/20">
        <CardContent class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShoppingCart class="w-5 h-5 text-primary" />
            <span class="font-medium text-sm">{{ totalItems }} item{{ totalItems !== 1 ? "s" : "" }}</span>
          </div>
          <span class="font-semibold">KES {{ totalPrice.toLocaleString() }}</span>
        </CardContent>
      </Card>
    </Transition>
  </div>
</template>
