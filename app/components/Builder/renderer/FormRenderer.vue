<script setup lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    CreditCard,
    Package,
    FileText,
  } from "lucide-vue-next";
  import { ref, reactive, computed } from "vue";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  const props = defineProps<{
    form: FormSchema;
    loading: boolean;
  }>();

  const emit = defineEmits<{
    submit: [
      data: {
        schema: FormSchema;
        formData: Record<string, any>;
        paymentData: { phoneNumber: string };
        selectedProducts: Record<string, { quantity: number; storeId: string }>;
      },
    ];
  }>();

  const currentStep = ref(1);
  const formData = reactive<Record<string, any>>({});
  const selectedProducts = reactive<Record<string, { quantity: number; storeId: string }>>({});
  const phoneNumber = ref("");

  const hasProducts = computed(() => (props.form.stores?.length ?? 0) > 0);
  const hasPrice = computed(() => Number(props.form.price) > 0);

  const steps = computed(() => {
    const s: { id: number; label: string; icon: any }[] = [];
    let n = 1;
    for (const page of props.form.pages) {
      s.push({ id: n++, label: page.title || `Page ${n - 1}`, icon: FileText });
    }
    if (hasProducts.value) {
      s.push({ id: n++, label: "Products", icon: Package });
    }
    s.push({ id: n++, label: "Review", icon: FileText });
    return s;
  });

  const maxStep = computed(() => steps.value.length);
  const progressPercent = computed(() => ((currentStep.value - 1) / (maxStep.value - 1)) * 100);
  const currentLabel = computed(
    () => steps.value.find((s) => s.id === currentStep.value)?.label ?? "",
  );

  // Which step type are we on
  const isPageStep = computed(() => currentStep.value <= props.form.pages.length);
  const isProductStep = computed(
    () => hasProducts.value && currentStep.value === props.form.pages.length + 1,
  );
  const isReviewStep = computed(() => currentStep.value === maxStep.value);

  const currentPageIndex = computed(() => currentStep.value - 1);
  const currentPage = computed(() => props.form.pages[currentPageIndex.value]);

  const next = () => {
    if (currentStep.value < maxStep.value) currentStep.value++;
  };

  const prev = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  const nextLabel = computed(() => {
    if (isReviewStep.value) {
      if (hasPrice.value) return `Pay KES ${Number(props.form.price).toLocaleString()}`;
      return "Submit";
    }
    if (isProductStep.value) return "Review";
    if (currentPageIndex.value < props.form.pages.length - 1) return "Continue";
    if (hasProducts.value) return "Select Products";
    return "Review";
  });

  const handleSubmit = () => {
    emit("submit", {
      schema: props.form,
      formData: { ...formData },
      selectedProducts: { ...selectedProducts },
      paymentData: { phoneNumber: phoneNumber.value },
    });
  };

  const handleAction = () => {
    if (isReviewStep.value) {
      handleSubmit();
    } else {
      next();
    }
  };

  const syncProducts = (val: Record<string, { quantity: number; storeId: string }>) => {
    for (const k of Object.keys(selectedProducts)) {
      if (!(k in val)) delete selectedProducts[k];
    }
    Object.assign(selectedProducts, val);
  };
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Top bar with progress -->
    <header
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div class="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <div>
          <h1 class="max-w-[200px] truncate text-sm font-semibold">
            {{ form.title }}
          </h1>
          <p class="text-muted-foreground text-xs">Step {{ currentStep }} of {{ maxStep }}</p>
        </div>
        <Badge variant="outline" class="text-xs">{{ currentLabel }}</Badge>
      </div>
      <div class="bg-muted h-1">
        <div
          class="bg-primary h-full transition-all duration-500 ease-out"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </header>

    <!-- Step indicators -->
    <div class="mx-auto max-w-3xl px-6 pt-6">
      <div class="flex flex-wrap items-center justify-center gap-1.5">
        <template v-for="(step, index) in steps" :key="step.id">
          <button
            @click="step.id < currentStep ? (currentStep = step.id) : null"
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors"
            :class="[
              step.id === currentStep
                ? 'bg-primary text-primary-foreground font-medium'
                : step.id < currentStep
                  ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
                  : 'text-muted-foreground',
            ]"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium"
              :class="[
                step.id === currentStep
                  ? 'border-primary-foreground/30 bg-primary-foreground/20'
                  : step.id < currentStep
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-muted-foreground/30',
              ]"
            >
              <Check v-if="step.id < currentStep" class="h-2.5 w-2.5" />
              <span v-else>{{ step.id }}</span>
            </span>
            <span class="hidden sm:inline">{{ step.label }}</span>
          </button>
          <div
            v-if="index < steps.length - 1"
            class="h-px w-6"
            :class="[step.id < currentStep ? 'bg-primary/30' : 'bg-border']"
          />
        </template>
      </div>
    </div>

    <!-- Content -->
    <main class="mx-auto max-w-4xl px-6 py-8">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <!-- Form page -->
        <div v-if="isPageStep && currentPage" :key="currentStep" class="space-y-6">
          <div class="space-y-1 text-center">
            <Badge variant="outline" class="text-[10px]">Page {{ currentStep }}</Badge>
            <h2 class="text-xl font-bold">{{ currentPage.title }}</h2>
            <p v-if="currentPage.description" class="text-muted-foreground text-sm">
              {{ currentPage.description }}
            </p>
          </div>
          <div class="space-y-5">
            <BuilderRendererField
              v-for="field in currentPage.fields"
              :key="field.id"
              :field="field"
              :model-value="formData[field.id]"
              @update:model-value="formData[field.id] = $event"
            />
            <p
              v-if="!currentPage.fields.length"
              class="text-muted-foreground py-8 text-center text-sm"
            >
              This page has no fields
            </p>
          </div>
        </div>

        <!-- Products -->
        <div v-else-if="isProductStep" :key="'products'" class="space-y-6">
          <div class="space-y-1 text-center">
            <Badge variant="outline" class="text-[10px]">Products</Badge>
            <h2 class="text-xl font-bold">Select Products</h2>
            <p class="text-muted-foreground text-sm">Choose items from available stores</p>
          </div>
          <BuilderRendererProducts
            :stores="form.stores ?? []"
            :selected="selectedProducts"
            @update:selected="syncProducts"
          />
        </div>

        <!-- Review -->
        <div v-else-if="isReviewStep" :key="'review'" class="space-y-6">
          <div class="space-y-1 text-center">
            <Badge variant="outline" class="text-[10px]">Review</Badge>
            <h2 class="text-xl font-bold">Review & Submit</h2>
            <p class="text-muted-foreground text-sm">Check your details before submitting</p>
          </div>
          <BuilderRendererReview
            :form="form"
            :form-data="formData"
            :selected-products="selectedProducts"
            :phone-number="phoneNumber"
            :is-submitting="loading"
            @update:phone-number="phoneNumber = $event"
            @submit="handleSubmit"
          />
        </div>
      </Transition>
    </main>

    <!-- Bottom nav -->
    <footer
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t backdrop-blur"
    >
      <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Button variant="ghost" @click="prev" :disabled="currentStep === 1">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          @click="handleAction"
          :disabled="loading"
          class="from-primary to-primary/90 bg-linear-to-r"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ nextLabel }}
          <ArrowRight v-if="!loading && !isReviewStep" class="ml-2 h-4 w-4" />
          <CreditCard v-if="!loading && isReviewStep && hasPrice" class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </footer>
  </div>
</template>
