<script setup lang="ts">
  import { Banknote, Gift, Phone, Store, Building2, Smartphone, ChevronRight } from "lucide-vue-next";
  import { ref, watch, computed } from "vue";
  import type { FormPayoutMethod } from "~~/shared/types";

  const props = defineProps<{
    isPaid: boolean;
    price: number;
    formType: "regular" | "product";
    payoutMethod?: FormPayoutMethod | null;
    payoutPhone?: string | null;
    payoutTill?: string | null;
    payoutPaybill?: string | null;
    payoutAccountNumber?: string | null;
  }>();

  const emit = defineEmits<{
    "update:isPaid": [value: boolean];
    "update:price": [value: number];
    "update:payoutMethod": [value: FormPayoutMethod | null];
    "update:payoutPhone": [value: string];
    "update:payoutTill": [value: string];
    "update:payoutPaybill": [value: string];
    "update:payoutAccountNumber": [value: string];
  }>();

  const localPrice = ref(props.price);
  watch(
    () => props.price,
    (v) => {
      localPrice.value = v;
    },
  );

  const flushPrice = () => {
    const val = parseFloat(String(localPrice.value));
    const parsed = isNaN(val) ? 0 : Math.max(0, val);
    if (parsed !== props.price) emit("update:price", parsed);
  };

  const needsPayout = computed(() => props.isPaid || props.formType === "product");

  const payoutMethods = [
    {
      id: "phone" as const,
      label: "Phone",
      subtitle: "B2C to personal",
      icon: Smartphone,
    },
    {
      id: "till" as const,
      label: "Till",
      subtitle: "B2B Buy Goods",
      icon: Store,
    },
    {
      id: "paybill" as const,
      label: "Paybill",
      subtitle: "B2B business",
      icon: Building2,
    },
  ];

  const pricingOptions = computed(() => [
    {
      id: "free",
      title: "Free",
      description:
        props.formType === "product"
          ? "Let users browse products without paying"
          : "No charge for submissions",
      icon: Gift,
    },
    {
      id: "paid",
      title: "Paid",
      description:
        props.formType === "product"
          ? "Charge a base fee on top of product prices"
          : "Charge a fee per submission",
      icon: Banknote,
    },
  ]);

  const phoneHint = computed(() => {
    if (!props.payoutPhone) return "e.g. 0712345678";
    const digits = props.payoutPhone.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 10) return "Number seems too short";
    if (digits.length > 10) return "Number seems too long";
    return "e.g. 0712345678";
  });
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 sm:px-6">
    <div class="w-full space-y-6 sm:space-y-8">
      <!-- Header -->
      <div class="space-y-2 text-center">
        <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Set pricing</h2>
        <p class="text-muted-foreground text-sm sm:text-base">
          {{
            formType === "product"
              ? "Choose if you want to charge a submission fee"
              : "Decide if this form is free or paid"
          }}
        </p>
      </div>

      <!-- Pricing Toggle -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          v-for="option in pricingOptions"
          :key="option.id"
          type="button"
          @click="emit('update:isPaid', option.id === 'paid')"
          class="group relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-200 sm:p-6"
          :class="[
            (option.id === 'paid') === isPaid
              ? 'border-primary bg-primary/5 shadow-primary/10 shadow-md'
              : 'border-border hover:border-primary/40 bg-card hover:shadow-md',
          ]"
        >
          <div
            class="mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-colors sm:mb-3 sm:h-12 sm:w-12"
            :class="[
              (option.id === 'paid') === isPaid
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
            ]"
          >
            <component :is="option.icon" class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 class="mb-1 text-base font-semibold sm:text-lg">{{ option.title }}</h3>
          <p class="text-muted-foreground max-w-[180px] text-xs leading-relaxed sm:text-sm">
            {{ option.description }}
          </p>
        </button>
      </div>

      <!-- Price Input -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-3"
      >
        <div v-if="isPaid" class="space-y-2 rounded-xl border bg-card p-4 sm:p-5">
          <Label for="price" class="text-sm font-medium">Amount (KES)</Label>
          <div class="relative">
            <span class="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium sm:text-base">
              KES
            </span>
            <Input
              id="price"
              type="number"
              v-model.number="localPrice"
              @blur="flushPrice"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="h-11 pr-4 pl-14 text-base sm:h-12 sm:text-lg"
            />
          </div>
          <p class="text-muted-foreground text-xs sm:text-sm">
            {{
              formType === "product"
                ? "Base submission fee. Product prices are set separately in the store."
                : "Users will be charged this amount per submission."
            }}
          </p>
        </div>
      </Transition>

      <!-- Payout destination -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-3"
      >
        <div v-if="needsPayout" class="space-y-4 sm:space-y-5">
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-base font-semibold sm:text-lg">Where should earnings go?</h3>
            <p class="text-muted-foreground text-xs sm:text-sm">
              After each successful payment, funds are sent here via M-Pesa.
            </p>
          </div>

          <!-- Method selector - responsive grid/pills -->
          <div class="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 sm:gap-3">
            <button
              v-for="m in payoutMethods"
              :key="m.id"
              type="button"
              @click="emit('update:payoutMethod', m.id)"
              class="flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left transition-all sm:flex-col sm:items-center sm:gap-1.5 sm:p-4 sm:text-center"
              :class="[
                payoutMethod === m.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground',
              ]"
            >
              <component
                :is="m.icon"
                class="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
              />
              <div class="min-w-0">
                <div class="text-sm font-medium leading-tight sm:text-base">{{ m.label }}</div>
                <div class="hidden text-[10px] opacity-60 sm:block sm:text-xs">{{ m.subtitle }}</div>
              </div>
            </button>
          </div>

          <!-- Payout input fields -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="payoutMethod"
              class="rounded-xl border bg-card p-4 sm:p-5"
            >
              <!-- Phone -->
              <div v-if="payoutMethod === 'phone'" class="space-y-3">
                <Label for="payoutPhone">M-Pesa phone number</Label>
                <Input
                  id="payoutPhone"
                  :model-value="payoutPhone || ''"
                  @update:model-value="emit('update:payoutPhone', String($event))"
                  :placeholder="phoneHint"
                  type="tel"
                  class="h-11 focus-visible:ring-primary"
                />
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Smartphone class="h-3.5 w-3.5" />
                  <span>We'll send payouts here via <span class="font-medium text-foreground/70">B2C</span></span>
                </div>
              </div>

              <!-- Till -->
              <div v-else-if="payoutMethod === 'till'" class="space-y-3">
                <Label for="payoutTill">Till number</Label>
                <Input
                  id="payoutTill"
                  :model-value="payoutTill || ''"
                  @update:model-value="emit('update:payoutTill', String($event))"
                  placeholder="e.g. 123456"
                  class="h-11 focus-visible:ring-primary"
                />
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Store class="h-3.5 w-3.5" />
                  <span>Buy Goods till — payouts via <span class="font-medium text-foreground/70">B2B</span></span>
                </div>
              </div>

              <!-- Paybill -->
              <div v-else-if="payoutMethod === 'paybill'" class="space-y-3">
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label for="payoutPaybill">Paybill number</Label>
                    <Input
                      id="payoutPaybill"
                      :model-value="payoutPaybill || ''"
                      @update:model-value="emit('update:payoutPaybill', String($event))"
                      placeholder="e.g. 400200"
                      class="h-11 focus-visible:ring-primary"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="payoutAccount">Account number</Label>
                    <Input
                      id="payoutAccount"
                      :model-value="payoutAccountNumber || ''"
                      @update:model-value="emit('update:payoutAccountNumber', String($event))"
                      placeholder="e.g. INV-001"
                      class="h-11 focus-visible:ring-primary"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 class="h-3.5 w-3.5" />
                  <span>Business paybill — payouts via <span class="font-medium text-foreground/70">B2B</span></span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>
