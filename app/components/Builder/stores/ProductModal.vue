<script setup lang="ts">
import type { Store, StoreItem } from "~~/shared/types";

const props = defineProps<{
  store: Store;
  isOpen: boolean;
  product?: StoreItem | null;
}>();
const emits = defineEmits<{
  close: [];
}>();
const form = ref<StoreItem>({
  id: "",
  name: "",
  description: "",
  price: 0,
  quantity: 0,
  infinite: false,
  images: [],
});

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = { ...newProduct };
  } else {
    form.value = {
      id: "",
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      infinite: false,
      images: [],
    };
  }
}, { immediate: true });

const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `prod_${timestamp}_${random}`;
};

const addProduct = () => {
  if (props.product) {
    const index = props.store.items.findIndex((p) => p.id == props.product?.id);
    if (index !== -1) {
      props.store.items[index] = { ...props.store.items[index], ...form.value };
    }
  } else {
    props.store.items.push({
      ...form.value,
      id: generateUniqueId(),
    });
  }

  emits("close");
};
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    Array.from(target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          form.value.images.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index: number) => {
  form.value.images.splice(index, 1);
};
</script>
<template>
  <Dialog :open="isOpen" @update:open="$emit('close')">
    <DialogScrollContent>
      <DialogHeader>
        <DialogTitle>Add Product</DialogTitle>
      </DialogHeader>
      <DialogDescription>Add a product</DialogDescription>
      <div>
        <form @submit.prevent="addProduct()" class="space-y-4">
          <div>
            <Label class="block text-sm font-medium mb-2">Name</Label>
            <Input
              v-model="form.name"
              required
              class="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">Description</Label>
            <Textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border rounded-md bg-background"
            ></Textarea>
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">Price</Label>
            <Input
              v-model.number="form.price"
              type="number"
              step="0.01"
              required
              class="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              id="infinite"
              :checked="form.infinite"
              @update:checked="(checked) => (form.infinite = checked)"
            />
            <Label for="infinite" class="cursor-pointer">Infinite Stock</Label>
          </div>
          <div v-if="!form.infinite">
            <Label class="block text-sm font-medium mb-2">Stock</Label>
            <Input
              v-model.number="form.quantity"
              type="number"
              required
              class="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">Images</Label>
            <Input
              @change="handleImageUpload"
              type="file"
              multiple
              accept="image/*"
              class="w-full px-3 py-2 border rounded-md bg-background"
            />
            <div
              v-if="form.images.length > 0"
              class="mt-2 grid grid-cols-3 gap-2"
            >
              <div
                v-for="(image, index) in form.images"
                :key="index"
                class="relative"
              >
                <img
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="w-full h-20 object-cover rounded"
                />
                <button
                  @click="removeImage(index)"
                  type="button"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-2 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {{ product ? "Update" : "Add" }}
            </button>
          </div>
        </form>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
