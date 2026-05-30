<script setup lang="ts">
  import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { NuxtLink } from "#components";
  import { authHeaders } from "~/lib/auth-client";

  const route = useRoute();
  const router = useRouter();
  const slug = route.params.slug as string;
  const { start, finish } = useLoadingIndicator();

  const { data: eventData, pending: eventPending } = await useFetch(`/api/events/${slug}`);
  const event = computed(() => eventData.value?.data);

  const formSlug = computed(() => event.value?.form?.slug ?? "");

  const formData = ref<any>(null);
  const formError = ref<any>(null);
  const loadingForm = computed(() => !!formSlug.value && !formData.value && !formError.value);

  if (formSlug.value) {
    try {
      formData.value = await $fetch(`/api/forms/${formSlug.value}`);
    } catch (e: any) {
      formError.value = e;
    }
  }

  const form = computed(() => formData.value || null);
  const loading = ref(false);

  const isPast = computed(() => {
    if (!event.value) return false;
    const now = new Date();
    if (event.value.endDate) return new Date(event.value.endDate) < now;
    return new Date(event.value.startDate) < now;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (data: {
    schema: FormSchema;
    formData: Record<string, any>;
    paymentData: { phoneNumber: string };
    selectedProducts: Record<string, { quantity: number; storeId: string }>;
  }) => {
    if (!form.value) return;
    loading.value = true;
    start();
    try {
      const submitData = await $fetch<any>(`/api/forms/${form.value.id}/submit`, {
        method: "post",
        body: data,
        headers: { ...(await authHeaders()) },
      });
      if (submitData) {
        toast.success(submitData.message);
        if (!submitData.payment) {
          await navigateTo(
            `/forms/${form.value.id}/submitted?submissionId=${submitData.submissionId}`,
          );
          return;
        }
        try {
          const checkPayment = async (checkoutId: string, maxRetries = 15, interval = 3000) => {
            let attempts = 0;
            while (attempts < maxRetries) {
              const res = await $fetch<any>(`/api/payments/${checkoutId}`);
              if (
                res.success &&
                res.data &&
                (res.data.status === "completed" || res.data.status === "failed")
              ) {
                return res;
              }
              attempts++;
              await new Promise((r) => setTimeout(r, interval));
            }
            throw new Error("Payment not completed in time");
          };
          await checkPayment(submitData.payment.checkoutId);
          toast.success("Payment completed!");
          await router.push(
            `/forms/${form.value.id}/submitted?submissionId=${submitData.submissionId}&checkoutId=${submitData.payment.checkoutId}`,
          );
        } catch {
          await router.push(
            `/forms/${form.value.id}/submitted?submissionId=${submitData.submissionId}&checkoutId=${submitData.payment.checkoutId}`,
          );
        }
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Something went wrong. Please try again.");
    } finally {
      loading.value = false;
      finish();
    }
  };

  useSeoMeta({
    title: () => (event.value ? `Register — ${event.value.title}` : "Register"),
    description: () => event.value?.description || `Register for ${event.value?.title}`,
  });
</script>

<template>
  <!-- Loading -->
  <div v-if="eventPending" class="bg-background min-h-screen">
    <div class="mx-auto max-w-6xl px-6 py-8">
      <div class="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        <div class="space-y-4">
          <Skeleton class="aspect-video w-full rounded-xl" />
          <Skeleton class="h-8 w-3/4" />
          <Skeleton class="h-5 w-1/2" />
        </div>
        <div class="space-y-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>
      </div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!event" class="bg-background min-h-screen">
    <div class="mx-auto flex max-w-4xl items-center justify-center px-6 py-32">
      <div class="text-center">
        <h1 class="mb-2 text-2xl font-bold">Event not found</h1>
        <p class="text-muted-foreground mb-4">This event doesn't exist or has been removed.</p>
        <Button as="NuxtLink" to="/events">Browse events</Button>
      </div>
    </div>
  </div>

  <!-- Register page -->
  <div v-else class="bg-background min-h-screen">
    <!-- Top bar -->
    <div class="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
        <Button variant="ghost" size="sm" :as="NuxtLink" :to="`/events/${slug}`">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to event
        </Button>
        <div class="bg-border h-4 w-px" />
        <p class="text-muted-foreground truncate text-sm font-medium">{{ event.title }}</p>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-6 py-8">
      <div class="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        <!-- Left: Event summary -->
        <div class="space-y-6">
          <!-- Image -->
          <EventsImageCarousel :images="event.images || []" :alt="event.title">
            <template #fallback>
              <Calendar class="text-muted-foreground h-12 w-12" />
            </template>
          </EventsImageCarousel>

          <!-- Title + badges -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="event.category" variant="secondary" class="capitalize">
                {{ event.category }}
              </Badge>
              <Badge v-if="isPast" variant="destructive">Past event</Badge>
            </div>
            <h1 class="text-2xl font-bold tracking-tight">{{ event.title }}</h1>
          </div>

          <!-- Info -->
          <div class="space-y-3">
            <div v-if="event.startDate" class="flex items-center gap-3 text-sm">
              <div class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Calendar class="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p class="font-medium">{{ formatDate(event.startDate) }}</p>
                <p v-if="event.endDate" class="text-muted-foreground text-xs">
                  to {{ formatDate(event.endDate) }}
                </p>
              </div>
            </div>
            <div v-if="event.startDate" class="flex items-center gap-3 text-sm">
              <div class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Clock class="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p class="font-medium">{{ formatTime(event.startDate) }}</p>
                <p v-if="event.endDate" class="text-muted-foreground text-xs">
                  to {{ formatTime(event.endDate) }}
                </p>
              </div>
            </div>
            <div v-if="event.venueName" class="flex items-center gap-3 text-sm">
              <div class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <MapPin class="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p class="font-medium">{{ event.venueName }}</p>
                <p v-if="event.venueAddress" class="text-muted-foreground text-xs">
                  {{ event.venueAddress }}
                </p>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="bg-muted/30 rounded-xl border px-4 py-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Price</span>
              <span class="text-lg font-bold">
                {{ event.isFree ? "Free" : `$${event.form?.price || "0"}` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Form -->
        <div>
          <div v-if="isPast" class="rounded-xl border border-dashed p-8 text-center">
            <Ticket class="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <h3 class="mb-1 text-lg font-semibold">Registration closed</h3>
            <p class="text-muted-foreground text-sm">This event has passed.</p>
          </div>

          <div v-else-if="formError" class="rounded-xl border border-dashed p-8 text-center">
            <h3 class="mb-1 text-lg font-semibold">Form unavailable</h3>
            <p class="text-muted-foreground text-sm">The registration form could not be loaded.</p>
          </div>

          <div v-else-if="form" class="rounded-xl border p-2">
            <BuilderRendererFormRenderer
              :form="form as any"
              :loading="loading"
              @submit="handleSubmit"
            />
          </div>

          <div v-else class="space-y-4">
            <Skeleton class="h-12 w-full rounded-lg" />
            <Skeleton class="h-12 w-full rounded-lg" />
            <Skeleton class="h-12 w-full rounded-lg" />
            <Skeleton class="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
