<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ArrowLeft, ArrowRight, Check, Loader2, CreditCard, Package, FileText } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { FormSchema } from "~~/shared/types";

const props = defineProps<{
  form: FormSchema;
}>();

const emit = defineEmits<{
  submit: [data: {
    schema: FormSchema;
    formData: Record<string, any>;
    paymentData: { phoneNumber: string };
    selectedProducts: Record<string, { quantity: number; storeId: string }>;
  }];
}>();

const currentStep = ref(1);
const formData = reactive<Record<string, any>>({});
const selectedProducts = reactive<Record<string, { quantity: number; storeId: string }>>({});
const phoneNumber = ref("");
const isSubmitting = ref(false);

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
const currentLabel = computed(() => steps.value.find((s) => s.id === currentStep.value)?.label ?? "");

// Which step type are we on
const isPageStep = computed(() => currentStep.value <= props.form.pages.length);
const isProductStep = computed(() => hasProducts.value && currentStep.value === props.form.pages.length + 1);
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
  isSubmitting.value = true;
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
  <div class="min-h-screen bg-background">
    <!-- Top bar with progress -->
    <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="max-w-3xl mx-auto flex h-14 items-center justify-between px-6">
        <div>
          <h1 class="text-sm font-semibold truncate max-w-[200px]">{{ form.title }}</h1>
          <p class="text-xs text-muted-foreground">Step {{ currentStep }} of {{ maxStep }}</p>
        </div>
        <Badge variant="outline" class="text-xs">{{ currentLabel }}</Badge>
      </div>
      <div class="h-1 bg-muted">
        <div class="h-full bg-primary transition-all duration-500 ease-out" :style="{ width: `${progressPercent}%` }" />
      </div>
    </header>

    <!-- Step indicators -->
    <div class="max-w-3xl mx-auto px-6 pt-6">
      <div class="flex items-center justify-center gap-1.5 flex-wrap">
        <template v-for="(step, index) in steps" :key="step.id">
          <button
            @click="step.id < currentStep ? (currentStep = step.id) : null"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors"
            :class="[
              step.id === currentStep
                ? 'bg-primary text-primary-foreground font-medium'
                : step.id < currentStep
                  ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                  : 'text-muted-foreground'
            ]"
          >
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border"
              :class="[
                step.id === currentStep
                  ? 'border-primary-foreground/30 bg-primary-foreground/20'
                  : step.id < currentStep
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-muted-foreground/30'
              ]"
            >
              <Check v-if="step.id < currentStep" class="w-2.5 h-2.5" />
              <span v-else>{{ step.id }}</span>
            </span>
            <span class="hidden sm:inline">{{ step.label }}</span>
          </button>
          <div v-if="index < steps.length - 1" class="w-6 h-px" :class="[step.id < currentStep ? 'bg-primary/30' : 'bg-border']" />
        </template>
      </div>
    </div>

    <!-- Content -->
    <main class="max-w-3xl mx-auto px-6 py-8">
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
          <div class="text-center space-y-1">
            <Badge variant="outline" class="text-[10px]">Page {{ currentStep }}</Badge>
            <h2 class="text-xl font-bold">{{ currentPage.title }}</h2>
            <p v-if="currentPage.description" class="text-sm text-muted-foreground">{{ currentPage.description }}</p>
          </div>
          <div class="space-y-5">
            <BuilderRendererField
              v-for="field in currentPage.fields"
              :key="field.id"
              :field="field"
              :model-value="formData[field.id]"
              @update:model-value="formData[field.id] = $event"
            />
            <p v-if="!currentPage.fields.length" class="text-center text-sm text-muted-foreground py-8">
              This page has no fields
            </p>
          </div>
        </div>

        <!-- Products -->
        <div v-else-if="isProductStep" :key="'products'" class="space-y-6">
          <div class="text-center space-y-1">
            <Badge variant="outline" class="text-[10px]">Products</Badge>
            <h2 class="text-xl font-bold">Select Products</h2>
            <p class="text-sm text-muted-foreground">Choose items from available stores</p>
          </div>
          <BuilderRendererProducts
            :stores="form.stores ?? []"
            :selected="selectedProducts"
            @update:selected="syncProducts"
          />
        </div>

        <!-- Review -->
        <div v-else-if="isReviewStep" :key="'review'" class="space-y-6">
          <div class="text-center space-y-1">
            <Badge variant="outline" class="text-[10px]">Review</Badge>
            <h2 class="text-xl font-bold">Review & Submit</h2>
            <p class="text-sm text-muted-foreground">Check your details before submitting</p>
          </div>
          <BuilderRendererReview
            :form="form"
            :form-data="formData"
            :selected-products="selectedProducts"
            :phone-number="phoneNumber"
            :is-submitting="isSubmitting"
            @update:phone-number="phoneNumber = $event"
            @submit="handleSubmit"
          />
        </div>
      </Transition>
    </main>

    <!-- Bottom nav -->
    <footer class="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
        <Button variant="ghost" @click="prev" :disabled="currentStep === 1">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button @click="handleAction" :disabled="isSubmitting" class="bg-gradient-to-r from-primary to-primary/90">
          <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
          {{ nextLabel }}
          <ArrowRight v-if="!isSubmitting && !isReviewStep" class="w-4 h-4 ml-2" />
          <CreditCard v-if="!isSubmitting && isReviewStep && hasPrice" class="w-4 h-4 ml-2" />
        </Button>
      </div>
    </footer>
  </div>
</template>
