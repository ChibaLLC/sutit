import { computed } from "vue";
import type { FormSchema } from "~~/shared/types";

export function useFormTotal(
  form: () => FormSchema,
  selected: () => Record<string, { quantity: number; storeId: string }>,
) {
  const productDetails = computed(() =>
    Object.entries(selected()).flatMap(([id, selection]) => {
      const store = form().stores?.find((store) => String(store.id) === String(selection.storeId));
      const product = store?.items.find((item) => String(item.id) === id);
      return product
        ? [{ name: product.name, price: Number(product.price), quantity: selection.quantity }]
        : [];
    }),
  );
  const productsTotal = computed(() =>
    productDetails.value.reduce((total, item) => total + item.price * item.quantity, 0),
  );
  const grandTotal = computed(
    () => Math.round(((Number(form().price) || 0) + productsTotal.value) * 100) / 100,
  );
  return { productDetails, productsTotal, grandTotal };
}
