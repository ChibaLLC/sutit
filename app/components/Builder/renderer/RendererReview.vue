<script setup lang="ts">
import { computed } from "vue";
import { FileText, Package, CreditCard, Loader2 } from "lucide-vue-next";
import type { FormSchema, PageSchema } from "~~/shared/types";

const props = defineProps<{
  form: FormSchema;
  formData: Record<string, any>;
  selectedProducts: Record<string, { quantity: number; storeId: string }>;
  phoneNumber: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  "update:phoneNumber": [value: string];
  submit: [];
}>();

const formatValue = (value: any): string => {
  if (value == null || value === "") return "Not provided";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const productDetails = computed(() => {
  const details: { name: string; price: number; quantity: number }[] = [];
  for (const [id, data] of Object.entries(props.selectedProducts)) {
    for (const store of props.form.stores ?? []) {
      const product = store.items.find((p) => p.id === id);
      if (product) {
        details.push({
          name: product.name,
          price: Number(product.price),
          quantity: data.quantity,
        });
      }
    }
  }
  return details;
});

const productsTotal = computed(() =>
  productDetails.value.reduce((sum, p) => sum + p.price * p.quantity, 0)
);

const grandTotal = computed(() =>
  Number(props.form.price) + productsTotal.value
);
</script>

<template>
  <div class="space-y-6">
    <!-- Form data review -->
    <div v-for="(page, pi) in form.pages" :key="page.id" class="space-y-3">
      <div class="flex items-center gap-2">
        <FileText class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-semibold text-sm">{{ page.title }}</h3>
      </div>
      <Card>
        <CardContent class="p-4 space-y-3">
          <div v-for="field in page.fields" :key="field.id" class="flex justify-between gap-4">
            <span class="text-sm text-muted-foreground">{{ field.label }}</span>
            <span class="text-sm font-medium text-right break-all">{{ formatValue(formData[field.id]) }}</span>
          </div>
          <p v-if="!page.fields.length" class="text-sm text-muted-foreground italic">No fields</p>
        </CardContent>
      </Card>
    </div>

    <!-- Products review -->
    <div v-if="productDetails.length" class="space-y-3">
      <div class="flex items-center gap-2">
        <Package class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-semibold text-sm">Products</h3>
      </div>
      <Card>
        <CardContent class="p-4 space-y-2">
          <div v-for="(item, i) in productDetails" :key="i" class="flex justify-between text-sm">
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span class="font-medium">KES {{ (item.price * item.quantity).toLocaleString() }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Payment section -->
    <div v-if="grandTotal > 0" class="space-y-4">
      <Separator />
      <div class="flex items-center justify-between py-2">
        <span class="font-semibold">Total</span>
        <span class="text-lg font-bold text-primary">KES {{ grandTotal.toLocaleString() }}</span>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium flex items-center gap-2">
          <div class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <span class="text-white text-[10px] font-bold">M</span>
          </div>
          M-Pesa Phone Number
        </Label>
        <Input
          :model-value="phoneNumber"
          @update:model-value="emit('update:phoneNumber', $event)"
          placeholder="254712345678"
          class="h-11"
        />
        <p class="text-xs text-muted-foreground">Enter your M-Pesa registered phone number</p>
      </div>

      <Card class="bg-green-50 border-green-200">
        <CardContent class="p-3">
          <ol class="text-xs text-green-700 space-y-1 list-decimal list-inside">
            <li>Click Pay below to receive an STK push</li>
            <li>Enter your M-Pesa PIN on your phone</li>
            <li>Wait for confirmation</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
