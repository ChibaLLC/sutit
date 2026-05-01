<script setup lang="ts">
  import { Package, Plus, Minus, ShoppingCart } from "lucide-vue-next";
  import { computed } from "vue";
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
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <Card
          v-for="product in store.items"
          :key="product.id"
          class="group overflow-hidden p-0 transition-all hover:shadow-md"
          :class="qty(product.id) > 0 ? 'border-primary/50 ring-primary/20 ring-1' : ''"
        >
          <div class="bg-muted relative aspect-square overflow-hidden">
            <NuxtImg
              v-if="product.images?.length"
              :src="product.images[0]"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <Package class="text-muted-foreground/50 h-12 w-12" />
            </div>
            <div
              v-if="qty(product.id) > 0"
              class="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {{ qty(product.id) }}
            </div>
          </div>
          <CardContent class="space-y-2 p-3">
            <div class="min-h-10">
              <h4 class="line-clamp-2 text-sm leading-tight font-medium">
                {{ product.name }}
              </h4>
            </div>
            <p v-if="product.description" class="text-muted-foreground line-clamp-1 text-xs">
              {{ product.description }}
            </p>
            <div class="flex items-center justify-between gap-2 pt-1">
              <span class="text-primary text-sm font-semibold"
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
                  <Minus class="h-3 w-3" />
                </Button>
                <span class="w-6 text-center text-xs font-medium">{{ qty(product.id) }}</span>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-7 w-7"
                  @click="changeQty(product.id, store.id.toString(), 1)"
                >
                  <Plus class="h-3 w-3" />
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
        class="bg-background/95 border-primary/30 fixed right-4 bottom-4 left-4 shadow-lg backdrop-blur-sm md:right-6 md:left-auto md:w-80"
      >
        <CardContent class="flex items-center justify-between gap-4 p-4">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <ShoppingCart class="text-primary h-5 w-5" />
            </div>
            <div>
              <span class="text-sm font-medium"
                >{{ totalItems }} item{{ totalItems !== 1 ? "s" : "" }}</span
              >
              <p class="text-muted-foreground text-xs">Total</p>
            </div>
          </div>
          <span class="text-primary text-lg font-bold">KES {{ totalPrice.toLocaleString() }}</span>
        </CardContent>
      </Card>
    </Transition>
  </div>
</template>
