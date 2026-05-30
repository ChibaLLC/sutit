<script setup lang="ts">
  import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-vue-next";
  import { ref, computed, watch } from "vue";
  import type { FormSchema, PageSchema, Store, EventSchema } from "~~/shared/types";

  const emit = defineEmits<{
    submit: [form: FormSchema];
  }>();

  const props = defineProps<{
    isSubmitting?: boolean;
    initialForm?: FormSchema | null;
    initialHasEvent?: boolean;
  }>();

  const isEdit = computed(() => !!props.initialForm);

  const formName = ref("");
  const formSlug = ref("");
  const formDescription = ref("");

  const hasEvent = ref(false);
  const event = ref<EventSchema>({
    title: "",
    description: "",
    slug: "",
    startDate: "",
    endDate: null,
    timezone: "UTC",
    venueName: "",
    venueAddress: "",
    contactPhone: "",
    contactEmail: "",
    category: "",
    audience: "",
    images: [],
    isFree: true,
    refundPolicy: "",
  });

  const formType = ref<"regular" | "product">("regular");

  const isPaid = ref(false);
  const price = ref(0);
  const requireMerch = ref(false);

  const pages = ref<PageSchema[]>([
    { id: Date.now(), title: "Page 1", description: "", fields: [], orderIndex: 1 },
  ]);

  const stores = ref<Store[]>([{ id: Date.now(), name: "Store 1", description: "", items: [] }]);

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
      hasEvent.value = f.hasEvent ?? false;
      requireMerch.value = f.requireMerch ?? false;
      if (f.event) {
        event.value = { ...event.value, ...f.event };
      }
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

  watch(
    () => props.initialHasEvent,
    (v) => {
      if (v) hasEvent.value = true;
    },
    { immediate: true },
  );

  watch(hasEvent, () => {
    const maxStep = steps.value.length;
    if (currentStep.value > maxStep) {
      currentStep.value = maxStep;
    }
  });

  watch(() => formType.value, (v) => {
    if (v === "product") requireMerch.value = true;
  });

  watch(() => formName.value, (name) => {
    event.value.slug = slugify(name);
  });

  const slugify = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const currentStep = ref(1);

  const steps = computed(() => {
    const showProducts = hasEvent.value ? requireMerch.value : formType.value === "product";
    const base = [
      { id: 1, label: "Basics" },
    ];
    if (hasEvent.value) {
      base.push({ id: 2, label: "Event" });
    } else {
      base.push({ id: 2, label: "Type" });
      base.push({ id: 3, label: "Pricing" });
    }
    if (showProducts) {
      base.push({ id: base.length + 1, label: "Products" });
    }
    base.push({ id: base.length + 1, label: "Fields" });
    base.push({ id: base.length + 1, label: "Settings" });
    base.push({ id: base.length + 1, label: "Review" });
    return base;
  });

  const eventStep = computed(() => hasEvent.value ? 2 : null);
  const typeStep = computed(() => hasEvent.value ? null : 2);
  const pricingStep = computed(() => hasEvent.value ? null : 3);
  const productsStep = computed(() => {
    const showProducts = hasEvent.value ? requireMerch.value : formType.value === "product";
    if (!showProducts) return null;
    return hasEvent.value ? 3 : (formType.value === "product" ? 5 : null);
  });
  const fieldsStep = computed(() => {
    const showProducts = hasEvent.value ? requireMerch.value : formType.value === "product";
    if (hasEvent.value) return showProducts ? 4 : 3;
    return showProducts ? 5 : 4;
  });
  const settingsStep = computed(() => {
    const showProducts = hasEvent.value ? requireMerch.value : formType.value === "product";
    if (hasEvent.value) return showProducts ? 5 : 4;
    return showProducts ? 6 : 5;
  });
  const reviewStep = computed(() => {
    const showProducts = hasEvent.value ? requireMerch.value : formType.value === "product";
    if (hasEvent.value) return showProducts ? 6 : 5;
    return showProducts ? 7 : 6;
  });

  const canProceed = computed(() => {
    const step = currentStep.value;
    if (step === 1) return formName.value.trim().length > 0 && formSlug.value.trim().length > 0;
    if (step === pricingStep.value) return !isPaid.value || price.value > 0;
    return true;
  });

  const nextStep = () => {
    if (canProceed.value && currentStep.value < steps.value.length) currentStep.value++;
  };

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  const buildFormSchema = (): FormSchema => {
    const base: any = {
      title: formName.value,
      description: formDescription.value,
      slug: formSlug.value,
      status: settings.value.status || "draft",
      price: isPaid.value ? price.value : 0,
      isPublic: settings.value.isPublic,
      requiresLogin: settings.value.requiresLogin,
      requireMerch: requireMerch.value,
      allowGroups: settings.value.allowGroups,
      calculateTat: false,
      allowMultipleSubmissions: settings.value.allowMultipleSubmissions,
      allowRegistrationReuse: false,
      submissionLimit: settings.value.submissionLimit,
      tags: settings.value.tags,
      pages: pages.value,
      stores: requireMerch.value ? stores.value : [],
      afterSubmissionMessage: settings.value.afterSubmissionMessage,
      infoPromptMessage: "",
      hasEvent: hasEvent.value,
      event: hasEvent.value
        ? {
            title: event.value.title || formName.value,
            description: event.value.description,
            slug: event.value.slug || formSlug.value,
            startDate: event.value.startDate,
            endDate: event.value.endDate || null,
            timezone: event.value.timezone,
            venueName: event.value.venueName,
            venueAddress: event.value.venueAddress,
            contactPhone: event.value.contactPhone,
            contactEmail: event.value.contactEmail,
            category: event.value.category,
            audience: event.value.audience,
            images: event.value.images,
            isFree: event.value.isFree,
            refundPolicy: event.value.refundPolicy,
          }
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
          :has-event="hasEvent"
          @update:name="formName = $event"
          @update:slug="formSlug = $event"
          @update:description="formDescription = $event"
          @update:has-event="hasEvent = $event"
        />
        <CreateFormStepEvent
          v-else-if="eventStep && currentStep === eventStep"
          :event="event"
          :require-merch="requireMerch"
          @update:event="event = $event"
          @update:require-merch="requireMerch = $event"
        />
        <CreateFormStepFormType
          v-else-if="typeStep && currentStep === typeStep"
          :model-value="formType"
          @update:model-value="formType = $event"
        />
        <CreateFormStepPricing
          v-else-if="pricingStep && currentStep === pricingStep"
          :is-paid="isPaid"
          :price="price"
          :form-type="formType"
          @update:is-paid="isPaid = $event"
          @update:price="price = $event"
        />
        <CreateFormStepFields
          v-else-if="currentStep === fieldsStep"
          :pages="pages"
          @update:pages="pages = $event"
        />
        <CreateFormStepProducts
          v-else-if="productsStep && currentStep === productsStep"
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
          :pages="pages"
          :stores="stores"
          :is-public="settings.isPublic"
          :requires-login="settings.requiresLogin"
          :allow-multiple-submissions="settings.allowMultipleSubmissions"
          :submission-limit="settings.submissionLimit"
          :has-event="hasEvent"
          :event="event"
        />
      </Transition>
    </main>

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
