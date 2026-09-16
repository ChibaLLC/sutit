import assert from "node:assert/strict";
import { test } from "node:test";

import { reactive } from "vue";

import { useFormTotal } from "../app/composables/useFormTotal";
import type { FormSchema } from "../shared/types";

test("checkout total tracks the form fee and product quantity changes", () => {
  const form = reactive({
    price: "100",
    stores: [{ id: "store", items: [{ id: "item", name: "Notebook", price: "250" }] }],
  }) as unknown as FormSchema;
  const selected = reactive<Record<string, { quantity: number; storeId: string }>>({});
  const { grandTotal, productsTotal } = useFormTotal(
    () => form,
    () => selected,
  );
  assert.equal(grandTotal.value, 100);
  selected.item = { quantity: 2, storeId: "store" };
  assert.equal(productsTotal.value, 500);
  assert.equal(grandTotal.value, 600);
  form.price = 0;
  assert.equal(grandTotal.value, 500);
  delete selected.item;
  assert.equal(grandTotal.value, 0);
});
