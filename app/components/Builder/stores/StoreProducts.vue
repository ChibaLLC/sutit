<script setup lang="ts">
import {
  PlusCircleIcon,
  Plus,
  Package,
  Trash2,
  Edit,
  ImageIcon,
} from "lucide-vue-next";
import type { Store, StoreItem } from "~~/shared/types";

const props = defineProps<{
  store: Store;
}>();
const productModalOpen = ref(false);
const selectedProduct = ref<StoreItem | null>(null);
const toggleProductModal = () => {
  productModalOpen.value = !productModalOpen.value;
  selectedProduct.value = null;
};
const editProduct = (p: StoreItem) => {
  selectedProduct.value = p;
  console.log(selectedProduct.value);
  productModalOpen.value = true;
};
const deleteProduct = (p: StoreItem) => {
  const index = props.store.items.indexOf(p);
  if (index) {
    props.store.items.splice(index, 1);
  }
};
</script>
<template>
  <div class="space-y-6">
    <!-- Header with Add Product Button -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-semibold tracking-tight">Products</h3>
        <p class="text-sm text-muted-foreground mt-1">
          Manage your store's product catalog
        </p>
      </div>
      <Button
        @click.prevent="toggleProductModal()"
        class="gap-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <PlusCircleIcon class="h-4 w-4" />
        Add Product
      </Button>
    </div>

    <!-- Product Modal -->
    <BuilderStoresProductModal
      :store="store"
      :product="selectedProduct"
      :isOpen="productModalOpen"
      @close="toggleProductModal()"
    />

    <!-- Products Grid -->
    <div
      v-if="store.items && store.items.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="product in store.items"
        :key="product.id"
        class="group border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <!-- Product Image -->
        <div class="aspect-video bg-muted relative overflow-hidden">
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0]"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50"
          >
            <div class="text-center">
              <ImageIcon class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <span class="text-sm">No Image</span>
            </div>
          </div>

          <!-- Quick Actions Overlay -->
          <div
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div class="flex gap-1">
              <Button
                @click="editProduct(product)"
                size="sm"
                variant="secondary"
                class="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <Edit class="h-3 w-3" />
              </Button>
              <Button
                @click="deleteProduct(product)"
                size="sm"
                variant="destructive"
                class="h-8 w-8 p-0 bg-destructive/80 backdrop-blur-sm hover:bg-destructive"
              >
                <Trash2 class="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-5">
          <div class="space-y-3">
            <div>
              <h4 class="font-semibold text-lg leading-tight line-clamp-1">
                {{ product.name }}
              </h4>
              <p
                class="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed"
              >
                {{ product.description || "No description available" }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t">
              <div class="flex items-center gap-1">
                <span class="text-2xl font-bold text-primary"
                  >Ksh {{ product.price?.toLocaleString() || "0" }}</span
                >
              </div>

              <div class="flex gap-2">
                <Button
                  @click="editProduct(product)"
                  variant="outline"
                  size="sm"
                  class="gap-1.5 hover:bg-accent transition-colors"
                >
                  <Edit class="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  @click="deleteProduct(product)"
                  variant="outline"
                  size="sm"
                  class="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 class="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div
        class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4"
      >
        <Package class="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold mb-2">No products yet</h3>
      <p class="text-muted-foreground mb-6 max-w-sm mx-auto">
        Get started by adding your first product to this store.
      </p>
      <Button @click="toggleProductModal()" class="gap-2">
        <Plus class="h-4 w-4" />
        Add Your First Product
      </Button>
    </div>
  </div>
</template>
