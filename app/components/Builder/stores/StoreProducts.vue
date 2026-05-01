<script setup lang="ts">
  import { PlusCircleIcon, Plus, Package, Trash2, Edit, ImageIcon } from "lucide-vue-next";
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
    if (index !== -1) {
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
        <p class="text-muted-foreground mt-1 text-sm">Manage your store's product catalog</p>
      </div>
      <Button
        @click.prevent="toggleProductModal()"
        class="gap-2 shadow-sm transition-all duration-200 hover:shadow-md"
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
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="product in store.items"
        :key="product.id"
        class="group bg-card overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <!-- Product Image -->
        <div class="bg-muted relative aspect-video overflow-hidden">
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0]"
            :alt="product.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            v-else
            class="text-muted-foreground from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br"
          >
            <div class="text-center">
              <ImageIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
              <span class="text-sm">No Image</span>
            </div>
          </div>

          <!-- Quick Actions Overlay -->
          <div
            class="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <div class="flex gap-1">
              <Button
                @click="editProduct(product)"
                size="sm"
                variant="secondary"
                class="bg-background/80 hover:bg-background h-8 w-8 p-0 backdrop-blur-sm"
              >
                <Edit class="h-3 w-3" />
              </Button>
              <Button
                @click="deleteProduct(product)"
                size="sm"
                variant="destructive"
                class="bg-destructive/80 hover:bg-destructive h-8 w-8 p-0 backdrop-blur-sm"
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
              <h4 class="line-clamp-1 text-lg leading-tight font-semibold">
                {{ product.name }}
              </h4>
              <p class="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                {{ product.description || "No description available" }}
              </p>
            </div>

            <div class="flex items-center justify-between border-t pt-2">
              <div class="flex items-center gap-1">
                <span class="text-primary text-2xl font-bold"
                  >Ksh {{ product.price?.toLocaleString() || "0" }}</span
                >
              </div>

              <div class="flex gap-2">
                <Button
                  @click="editProduct(product)"
                  variant="outline"
                  size="sm"
                  class="hover:bg-accent gap-1.5 transition-colors"
                >
                  <Edit class="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  @click="deleteProduct(product)"
                  variant="outline"
                  size="sm"
                  class="text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground gap-1.5 transition-colors"
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
    <div v-else class="py-12 text-center">
      <div class="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
        <Package class="text-muted-foreground h-12 w-12" />
      </div>
      <h3 class="mb-2 text-lg font-semibold">No products yet</h3>
      <p class="text-muted-foreground mx-auto mb-6 max-w-sm">
        Get started by adding your first product to this store.
      </p>
      <Button @click="toggleProductModal()" class="gap-2">
        <Plus class="h-4 w-4" />
        Add Your First Product
      </Button>
    </div>
  </div>
</template>
