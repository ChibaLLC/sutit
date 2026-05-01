<script setup lang="ts">
  import { FileText, Package, CreditCard, Loader2 } from "lucide-vue-next";
  import { computed } from "vue";
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
    productDetails.value.reduce((sum, p) => sum + p.price * p.quantity, 0),
  );

  const grandTotal = computed(() => Number(props.form.price) + productsTotal.value);
</script>

<template>
  <div class="space-y-6">
    <!-- Form data review -->
    <div v-for="(page, pi) in form.pages" :key="page.id" class="space-y-3">
      <div class="flex items-center gap-2">
        <FileText class="text-muted-foreground h-4 w-4" />
        <h3 class="text-sm font-semibold">{{ page.title }}</h3>
      </div>
      <Card>
        <CardContent class="space-y-3 p-4">
          <div v-for="field in page.fields" :key="field.id" class="flex justify-between gap-4">
            <span class="text-muted-foreground text-sm">{{ field.label }}</span>
            <span class="text-right text-sm font-medium break-all">{{
              formatValue(formData[field.id])
            }}</span>
          </div>
          <p v-if="!page.fields.length" class="text-muted-foreground text-sm italic">No fields</p>
        </CardContent>
      </Card>
    </div>

    <!-- Products review -->
    <div v-if="productDetails.length" class="space-y-3">
      <div class="flex items-center gap-2">
        <Package class="text-muted-foreground h-4 w-4" />
        <h3 class="text-sm font-semibold">Products</h3>
      </div>
      <Card>
        <CardContent class="space-y-2 p-4">
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
        <span class="text-primary text-lg font-bold">KES {{ grandTotal.toLocaleString() }}</span>
      </div>

      <div class="space-y-2">
        <Label class="flex items-center gap-2 text-sm font-medium">
          <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
            <span class="text-[10px] font-bold text-white">M</span>
          </div>
          M-Pesa Phone Number
        </Label>
        <Input
          :model-value="phoneNumber"
          @update:model-value="emit('update:phoneNumber', $event)"
          placeholder="254712345678"
          class="h-11"
        />
        <p class="text-muted-foreground text-xs">Enter your M-Pesa registered phone number</p>
      </div>

      <Card class="border-green-200 bg-green-50">
        <CardContent class="p-3">
          <ol class="list-inside list-decimal space-y-1 text-xs text-green-700">
            <li>Click Pay below to receive an STK push</li>
            <li>Enter your M-Pesa PIN on your phone</li>
            <li>Wait for confirmation</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
