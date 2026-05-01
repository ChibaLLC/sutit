<script setup lang="ts">
  import { Plus, Trash2, ShoppingBag, Package, X } from "lucide-vue-next";
  import { ref, watch } from "vue";
  import type { Store, StoreItem } from "~~/shared/types";

  const props = defineProps<{
    stores: Store[];
  }>();

  const emit = defineEmits<{
    "update:stores": [stores: Store[]];
  }>();

  const currentStoreIndex = ref(0);
  const editingItemId = ref<string | null>(null);

  // Local editable refs for the currently-edited item
  const editName = ref("");
  const editPrice = ref(0);
  const editQuantity = ref(0);
  const editDescription = ref("");

  const syncEditFields = (item: StoreItem) => {
    editName.value = item.name;
    editPrice.value = Number(item.price);
    editQuantity.value = item.quantity;
    editDescription.value = item.description || "";
  };

  const startEditing = (item: StoreItem) => {
    // flush previous before switching
    if (editingItemId.value && editingItemId.value !== item.id) {
      flushItemEdit(editingItemId.value);
    }
    editingItemId.value = item.id;
    syncEditFields(item);
  };

  const flushItemEdit = (itemId: string) => {
    const store = props.stores[currentStoreIndex.value];
    if (!store) return;
    const item = store.items.find((i) => i.id === itemId);
    if (!item) return;

    const updates: Partial<StoreItem> = {};
    if (editName.value !== item.name) updates.name = editName.value;
    if (editPrice.value !== Number(item.price)) updates.price = editPrice.value;
    if (editQuantity.value !== item.quantity) updates.quantity = editQuantity.value;
    if (editDescription.value !== (item.description || ""))
      updates.description = editDescription.value;

    if (Object.keys(updates).length) {
      updateItem(itemId, updates);
    }
  };

  const stopEditing = () => {
    if (editingItemId.value) {
      flushItemEdit(editingItemId.value);
    }
    editingItemId.value = null;
  };

  // --- store / item CRUD ---

  const updateStores = (updated: Store[]) => emit("update:stores", updated);

  const addStore = () => {
    const newStore: Store = {
      id: Date.now(),
      name: `Store ${props.stores.length + 1}`,
      description: "",
      items: [],
    };
    updateStores([...props.stores, newStore]);
    currentStoreIndex.value = props.stores.length;
  };

  const removeStore = (index: number) => {
    if (props.stores.length <= 1) return;
    const updated = props.stores.filter((_, i) => i !== index);
    updateStores(updated);
    if (currentStoreIndex.value >= updated.length) {
      currentStoreIndex.value = updated.length - 1;
    }
  };

  const updateStoreField = (index: number, key: keyof Store, value: any) => {
    const updated = [...props.stores];
    updated[index] = { ...updated[index], [key]: value } as Store;
    updateStores(updated);
  };

  const addItem = () => {
    const store = props.stores[currentStoreIndex.value];
    if (!store) return;
    const item: StoreItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      infinite: false,
      images: [],
    };
    const updated = [...props.stores];
    updated[currentStoreIndex.value] = {
      ...store,
      items: [...store.items, item],
    };
    updateStores(updated);
    startEditing(item);
  };

  const removeItem = (itemId: string) => {
    const store = props.stores[currentStoreIndex.value];
    if (!store) return;
    const updated = [...props.stores];
    updated[currentStoreIndex.value] = {
      ...store,
      items: store.items.filter((i) => i.id !== itemId),
    };
    updateStores(updated);
    if (editingItemId.value === itemId) editingItemId.value = null;
  };

  const updateItem = (itemId: string, updates: Partial<StoreItem>) => {
    const store = props.stores[currentStoreIndex.value];
    if (!store) return;
    const updated = [...props.stores];
    updated[currentStoreIndex.value] = {
      ...store,
      items: store.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    };
    updateStores(updated);
  };

  const toggleInfinite = (itemId: string, val: boolean) => {
    updateItem(itemId, { infinite: val });
  };

  // store name local ref
  const editStoreName = ref("");
  watch(
    currentStoreIndex,
    (idx) => {
      editStoreName.value = props.stores[idx]?.name ?? "";
    },
    { immediate: true },
  );

  const flushStoreName = () => {
    const store = props.stores[currentStoreIndex.value];
    if (store && editStoreName.value !== store.name) {
      updateStoreField(currentStoreIndex.value, "name", editStoreName.value);
    }
  };
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-8 space-y-2 text-center">
      <h2 class="text-2xl font-bold tracking-tight">Add your products</h2>
      <p class="text-muted-foreground">Create stores and add products to sell</p>
    </div>

    <!-- Store Tabs -->
    <div class="mb-6 flex items-center gap-2">
      <div class="flex flex-1 items-center gap-1 overflow-x-auto">
        <div
          v-for="(store, index) in stores"
          :key="store.id"
          class="group relative flex items-center"
        >
          <button
            @click="currentStoreIndex = index"
            class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all"
            :class="[
              currentStoreIndex === index
                ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ]"
          >
            <ShoppingBag class="h-3.5 w-3.5" />
            <!-- selected tab: inline input using local ref -->
            <input
              v-if="currentStoreIndex === index"
              v-model="editStoreName"
              @click.stop
              @blur="flushStoreName"
              class="w-24 bg-transparent font-medium text-inherit outline-none"
            />
            <span v-else>{{ store.name }}</span>
            <Badge
              variant="secondary"
              class="ml-1 px-1.5 py-0 text-[10px]"
              :class="
                currentStoreIndex === index
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : ''
              "
            >
              {{ store.items.length }}
            </Badge>
          </button>
          <button
            v-if="stores.length > 1"
            @click.stop="removeStore(index)"
            class="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X class="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="addStore" class="shrink-0 border-dashed">
        <Plus class="mr-1 h-3.5 w-3.5" />
        Store
      </Button>
    </div>

    <!-- Store Description -->
    <div class="mb-6" v-if="stores[currentStoreIndex]">
      <Input
        :model-value="stores[currentStoreIndex].description ?? ''"
        @update:model-value="updateStoreField(currentStoreIndex, 'description', $event)"
        placeholder="Store description (optional)"
        class="h-9 text-sm"
      />
    </div>

    <!-- Products List -->
    <div class="space-y-3" v-if="stores[currentStoreIndex]">
      <template v-if="stores[currentStoreIndex].items.length">
        <Card
          v-for="item in stores[currentStoreIndex].items"
          :key="item.id"
          class="group cursor-pointer transition-all"
          :class="[
            editingItemId === item.id
              ? 'border-primary ring-primary/20 shadow-md ring-1'
              : 'hover:border-primary/30 hover:shadow-sm',
          ]"
          @click="startEditing(item)"
        >
          <CardContent class="p-4">
            <!-- Item Header -->
            <div class="flex items-center gap-3">
              <div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Package class="text-muted-foreground h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ item.name || "Unnamed product" }}</span>
                  <Badge v-if="item.infinite" variant="secondary" class="text-[10px]"
                    >Unlimited</Badge
                  >
                </div>
                <div class="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                  <span>KES {{ Number(item.price).toLocaleString() }}</span>
                  <span v-if="!item.infinite">{{ item.quantity }} in stock</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                class="hover:text-destructive h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                @click.stop="removeItem(item.id)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>

            <!-- Item Editor -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[500px]"
              leave-active-class="transition-all duration-150"
              leave-from-class="opacity-100 max-h-[500px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div
                v-if="editingItemId == item.id"
                class="mt-4 space-y-4 overflow-hidden border-t pt-4"
                @click.stop
              >
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <Label class="text-xs">Product name </Label>
                    <Input
                      v-model="editName"
                      placeholder="e.g. T-Shirt, Ticket"
                      class="h-9 text-sm"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">Price (KES)</Label>
                    <Input
                      v-model.number="editPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="h-9 text-sm"
                    />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <Label class="text-xs">Description</Label>
                  <Textarea
                    v-model="editDescription"
                    placeholder="Brief description of this product"
                    rows="2"
                    class="resize-none text-sm"
                  />
                </div>

                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <Switch v-model="item.infinite" />
                    <Label class="text-xs">Unlimited stock</Label>
                  </div>
                  <div v-if="!item.infinite" class="flex items-center gap-2">
                    <Label class="text-xs">Quantity:</Label>
                    <Input
                      v-model.number="editQuantity"
                      type="number"
                      min="0"
                      class="h-8 w-20 text-sm"
                    />
                  </div>
                </div>
              </div>
            </Transition>
          </CardContent>
        </Card>
      </template>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center"
      >
        <div class="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
          <Package class="text-muted-foreground h-6 w-6" />
        </div>
        <h3 class="mb-1 font-semibold">No products yet</h3>
        <p class="text-muted-foreground mb-4 text-sm">Add products to your store</p>
      </div>

      <Button variant="outline" class="w-full border-dashed" @click="addItem">
        <Plus class="mr-2 h-4 w-4" />
        Add product
      </Button>
    </div>
  </div>
</template>
