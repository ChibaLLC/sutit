<script setup lang="ts">
  import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-vue-next";
  import { ref, computed, watch } from "vue";
  import type { FormSchema, PageSchema, Store } from "~~/shared/types";

  const emit = defineEmits<{
    submit: [form: FormSchema];
  }>();

  const props = defineProps<{
    isSubmitting?: boolean;
    initialForm?: FormSchema | null;
  }>();

  const isEdit = computed(() => !!props.initialForm);

  // Step 1: Basic Info
  const formName = ref("");
  const formSlug = ref("");
  const formDescription = ref("");

  // Step 2: Form Type
  const formType = ref<"regular" | "product">("regular");

  // Step 3: Pricing + payout destination
  const isPaid = ref(false);
  const price = ref(0);
  const payoutMethod = ref<"phone" | "till" | "paybill" | null>(null);
  const payoutPhone = ref("");
  const payoutTill = ref("");
  const payoutPaybill = ref("");
  const payoutAccountNumber = ref("");

  // Step 4: Fields
  const pages = ref<PageSchema[]>([
    { id: Date.now(), title: "Page 1", description: "", fields: [], orderIndex: 1 },
  ]);

  // Step 5: Products (product forms only)
  const stores = ref<Store[]>([{ id: Date.now(), name: "Store 1", description: "", items: [] }]);

  // Step 6: Settings
  const settings = ref({
    isPublic: true,
    requiresLogin: false,
    allowMultipleSubmissions: false,
    submissionLimit: null as number | null,
    allowGroups: false,
    afterSubmissionMessage: "",
    status: "draft" as string,
    tags: [] as string[],
  });

  // Pre-fill from initialForm (edit mode)
  watch(
    () => props.initialForm,
    (f) => {
      if (!f) return;
      formName.value = f.title ?? "";
      formSlug.value = f.slug ?? "";
      formDescription.value = f.description ?? "";
      formType.value = f.requireMerch ? "product" : "regular";
      isPaid.value = Number(f.price) > 0;
      price.value = Number(f.price) || 0;
      payoutMethod.value = f.payoutMethod ?? null;
      payoutPhone.value = f.payoutPhone ?? "";
      payoutTill.value = f.payoutTill ?? "";
      payoutPaybill.value = f.payoutPaybill ?? "";
      payoutAccountNumber.value = f.payoutAccountNumber ?? "";
      if (f.pages?.length) {
        pages.value = f.pages.map((p: any) => ({
          ...p,
          fields: (p.fields ?? []).map((fld: any) => ({ ...fld })),
        }));
      }
      if (f.stores?.length) {
        stores.value = f.stores.map((s: any) => ({
          ...s,
          items: (s.items ?? []).map((it: any) => ({
            ...it,
            infinite: it.isInfinite ?? it.infinite ?? false,
          })),
        }));
      }
      settings.value = {
        isPublic: f.isPublic ?? true,
        requiresLogin: f.requiresLogin ?? false,
        allowMultipleSubmissions: f.allowMultipleSubmissions ?? false,
        submissionLimit: f.submissionLimit ?? null,
        allowGroups: f.allowGroups ?? false,
        afterSubmissionMessage: f.afterSubmissionMessage ?? "",
        status: f.status ?? "draft",
        tags: f.tags ?? [],
      };
    },
    { immediate: true },
  );

  const currentStep = ref(1);

  const steps = computed(() => {
    const base = [
      { id: 1, label: "Basics" },
      { id: 2, label: "Type" },
      { id: 3, label: "Pricing" },
      { id: 4, label: "Fields" },
    ];
    if (formType.value === "product") base.push({ id: 5, label: "Products" });
    base.push({ id: formType.value === "product" ? 6 : 5, label: "Settings" });
    base.push({ id: formType.value === "product" ? 7 : 6, label: "Review" });
    return base;
  });

  const settingsStep = computed(() => (formType.value === "product" ? 6 : 5));
  const reviewStep = computed(() => (formType.value === "product" ? 7 : 6));
  const productsStep = 5;

  const payoutValid = computed(() => {
    const needsPayout = isPaid.value || formType.value === "product";
    if (!needsPayout) return true;
    if (!payoutMethod.value) return false;
    if (payoutMethod.value === "phone") {
      return /^(?:254|\+254|0)?[17]\d{8}$/.test(payoutPhone.value.trim());
    }
    if (payoutMethod.value === "till") {
      return /^\d{5,10}$/.test(payoutTill.value.trim());
    }
    if (payoutMethod.value === "paybill") {
      return (
        /^\d{5,10}$/.test(payoutPaybill.value.trim()) &&
        payoutAccountNumber.value.trim().length > 0
      );
    }
    return false;
  });

  const canProceed = computed(() => {
    const step = currentStep.value;
    if (step === 1) return formName.value.trim().length > 0 && formSlug.value.trim().length > 0;
    if (step === 3) {
      if (isPaid.value && !(price.value > 0)) return false;
      return payoutValid.value;
    }
    return true;
  });

  const nextStep = () => {
    if (canProceed.value && currentStep.value < steps.value.length) currentStep.value++;
  };

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  const buildFormSchema = (): FormSchema => {
    const needsPayout = isPaid.value || formType.value === "product";
    const base: any = {
      title: formName.value,
      description: formDescription.value,
      slug: formSlug.value,
      status: settings.value.status || "draft",
      price: isPaid.value ? price.value : 0,
      isPublic: settings.value.isPublic,
      requiresLogin: settings.value.requiresLogin,
      requireMerch: formType.value === "product",
      allowGroups: settings.value.allowGroups,
      calculateTat: false,
      allowMultipleSubmissions: settings.value.allowMultipleSubmissions,
      allowRegistrationReuse: false,
      submissionLimit: settings.value.submissionLimit,
      tags: settings.value.tags,
      pages: pages.value,
      stores: formType.value === "product" ? stores.value : [],
      afterSubmissionMessage: settings.value.afterSubmissionMessage,
      infoPromptMessage: "",
      payoutMethod: needsPayout ? payoutMethod.value : null,
      payoutPhone: needsPayout && payoutMethod.value === "phone" ? payoutPhone.value.trim() : null,
      payoutTill: needsPayout && payoutMethod.value === "till" ? payoutTill.value.trim() : null,
      payoutPaybill:
        needsPayout && payoutMethod.value === "paybill" ? payoutPaybill.value.trim() : null,
      payoutAccountNumber:
        needsPayout && payoutMethod.value === "paybill"
          ? payoutAccountNumber.value.trim()
          : null,
    };

    if (isEdit.value && props.initialForm) {
      base.id = props.initialForm.id;
      base.createdBy = props.initialForm.createdBy;
      base.createdAt = props.initialForm.createdAt;
      base.updatedAt = props.initialForm.updatedAt;
      base.publishedAt = props.initialForm.publishedAt;
    }

    return base;
  };

  const handleSubmit = () => emit("submit", buildFormSchema());

  const progressPercent = computed(
    () => ((currentStep.value - 1) / (steps.value.length - 1)) * 100,
  );
  const currentStepLabel = computed(
    () => steps.value.find((s) => s.id === currentStep.value)?.label ?? "",
  );
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Top bar -->
    <header
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="sm" class="h-9 w-9 p-0" @click="navigateTo('/forms')">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-sm font-semibold">{{ isEdit ? "Edit form" : "Create new form" }}</h1>
            <p class="text-muted-foreground text-xs">
              Step {{ currentStep }} of {{ steps.length }}
            </p>
          </div>
        </div>
        <Badge variant="outline" class="text-xs">{{ currentStepLabel }}</Badge>
      </div>
      <div class="bg-muted h-1">
        <div
          class="bg-primary h-full transition-all duration-500 ease-out"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </header>

    <!-- Step indicators -->
    <div class="mx-auto max-w-6xl px-6 pt-6">
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

    <!-- Step content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <CreateFormStepBasicInfo
          v-if="currentStep === 1"
          :name="formName"
          :slug="formSlug"
          :description="formDescription"
          @update:name="formName = $event"
          @update:slug="formSlug = $event"
          @update:description="formDescription = $event"
        />
        <CreateFormStepFormType
          v-else-if="currentStep === 2"
          :model-value="formType"
          @update:model-value="formType = $event"
        />
        <CreateFormStepPricing
          v-else-if="currentStep === 3"
          :is-paid="isPaid"
          :price="price"
          :form-type="formType"
          :payout-method="payoutMethod"
          :payout-phone="payoutPhone"
          :payout-till="payoutTill"
          :payout-paybill="payoutPaybill"
          :payout-account-number="payoutAccountNumber"
          @update:is-paid="isPaid = $event"
          @update:price="price = $event"
          @update:payout-method="payoutMethod = $event"
          @update:payout-phone="payoutPhone = $event"
          @update:payout-till="payoutTill = $event"
          @update:payout-paybill="payoutPaybill = $event"
          @update:payout-account-number="payoutAccountNumber = $event"
        />
        <CreateFormStepFields
          v-else-if="currentStep === 4"
          :pages="pages"
          @update:pages="pages = $event"
        />
        <CreateFormStepProducts
          v-else-if="formType === 'product' && currentStep === productsStep"
          :stores="stores"
          @update:stores="stores = $event"
        />
        <CreateFormStepSettings
          v-else-if="currentStep === settingsStep"
          :is-public="settings.isPublic"
          :requires-login="settings.requiresLogin"
          :allow-multiple-submissions="settings.allowMultipleSubmissions"
          :submission-limit="settings.submissionLimit"
          :allow-groups="settings.allowGroups"
          :after-submission-message="settings.afterSubmissionMessage"
          :form-type="formType"
          @update:is-public="settings.isPublic = $event"
          @update:requires-login="settings.requiresLogin = $event"
          @update:allow-multiple-submissions="settings.allowMultipleSubmissions = $event"
          @update:submission-limit="settings.submissionLimit = $event"
          @update:allow-groups="settings.allowGroups = $event"
          @update:after-submission-message="settings.afterSubmissionMessage = $event"
        />
        <CreateFormStepReview
          v-else-if="currentStep === reviewStep"
          :name="formName"
          :slug="formSlug"
          :description="formDescription"
          :form-type="formType"
          :is-paid="isPaid"
          :price="price"
          :payout-method="payoutMethod"
          :payout-phone="payoutPhone"
          :payout-till="payoutTill"
          :payout-paybill="payoutPaybill"
          :payout-account-number="payoutAccountNumber"
          :pages="pages"
          :stores="stores"
          :is-public="settings.isPublic"
          :requires-login="settings.requiresLogin"
          :allow-multiple-submissions="settings.allowMultipleSubmissions"
          :submission-limit="settings.submissionLimit"
        />
      </Transition>
    </main>

    <!-- Bottom nav -->
    <footer
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t backdrop-blur"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Button variant="ghost" @click="prevStep" :disabled="currentStep === 1">
          <ArrowLeft class="mr-2 h-4 w-4" /> Back
        </Button>

        <Button v-if="currentStep < reviewStep" @click="nextStep" :disabled="!canProceed">
          Continue <ArrowRight class="ml-2 h-4 w-4" />
        </Button>

        <Button
          v-else
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="from-primary to-primary/90 bg-gradient-to-r"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEdit ? "Save changes" : "Create form" }}
          <ArrowRight v-if="!isSubmitting" class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </footer>
  </div>
</template>
