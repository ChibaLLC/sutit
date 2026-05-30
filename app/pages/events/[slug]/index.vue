<script setup lang="ts">
  import { Calendar, Clock, Mail, MapPin, Phone, Share2, Ticket, Users } from "lucide-vue-next";

  import { NuxtLink } from "#components";

  const route = useRoute();
  const slug = route.params.slug as string;

  const { data: eventData, pending } = await useFetch(`/api/events/${slug}`);
  const event = computed(() => eventData.value?.data);

  if (event.value) {
    useSeoMeta({
      title: event.value.title,
      description: event.value.description || `Event: ${event.value.title}`,
      ogImage: event.value.images?.[0] || undefined,
    });
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

  const isPast = computed(() => {
    if (!event.value) return false;
    const now = new Date();
    if (event.value.endDate) return new Date(event.value.endDate) < now;
    return new Date(event.value.startDate) < now;
  });

  const shareEvent = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.value?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const activeTab = ref("description");

  const { data: relatedData } = await useFetch<{ data: any[] }>(`/api/events`, {
    query: {
      status: "upcoming",
      category: event.value?.category || undefined,
      limit: 3,
    },
    immediate: !!event.value,
  });

  const relatedEvents = computed(() => {
    const all = relatedData.value?.data || [];
    return all.filter((e: any) => e.id !== event.value?.id).slice(0, 3);
  });
</script>

<template>
  <!-- Loading -->
  <div v-if="pending" class="bg-background min-h-screen">
    <div class="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Skeleton class="aspect-video w-full rounded-2xl" />
      <Skeleton class="h-10 w-2/3" />
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" />
      </div>
      <Skeleton class="h-32 w-full rounded-xl" />
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!event" class="bg-background min-h-screen">
    <div class="mx-auto flex max-w-4xl items-center justify-center px-6 py-32">
      <div class="text-center">
        <div class="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Calendar class="text-muted-foreground h-8 w-8" />
        </div>
        <h1 class="mb-2 text-2xl font-bold">Event not found</h1>
        <p class="text-muted-foreground mb-6">This event doesn't exist or has been removed.</p>
        <Button as="NuxtLink" to="/events" variant="outline">Browse events</Button>
      </div>
    </div>
  </div>

  <!-- Event page -->
  <div v-else class="bg-background min-h-screen">
    <div class="mx-auto max-w-5xl px-6 py-8">
      <!-- Image Carousel -->
      <EventsImageCarousel :images="event.images || []" :alt="event.title">
        <template #fallback>
          <Calendar class="text-muted-foreground h-16 w-16" />
        </template>
      </EventsImageCarousel>

      <!-- Title row -->
      <div class="mt-6 flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <Badge v-if="event.category" variant="secondary" class="capitalize">
              {{ event.category }}
            </Badge>
            <Badge v-if="isPast" variant="outline">Past event</Badge>
          </div>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
            {{ event.title }}
          </h1>
        </div>
        <Button variant="outline" size="sm" @click="shareEvent" class="shrink-0">
          <Share2 class="h-4 w-4" />
        </Button>
      </div>

      <!-- Quick info chips -->
      <div class="mt-6 flex flex-wrap gap-3">
        <div
          v-if="event.startDate"
          class="bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <Calendar class="text-muted-foreground h-4 w-4" />
          <span class="font-medium">{{ formatDate(event.startDate) }}</span>
          <span v-if="event.endDate" class="text-muted-foreground"
            >— {{ formatDate(event.endDate) }}</span
          >
        </div>
        <div
          v-if="event.startDate"
          class="bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <Clock class="text-muted-foreground h-4 w-4" />
          <span class="font-medium">{{ formatTime(event.startDate) }}</span>
          <span v-if="event.endDate" class="text-muted-foreground"
            >— {{ formatTime(event.endDate) }}</span
          >
        </div>
        <div
          v-if="event.venueName"
          class="bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <MapPin class="text-muted-foreground h-4 w-4" />
          <span class="font-medium">{{ event.venueName }}</span>
        </div>
        <div
          v-if="event.audience"
          class="bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <Users class="text-muted-foreground h-4 w-4" />
          <span>{{ event.audience }}</span>
        </div>
      </div>

      <!-- CTA bar -->
      <div class="bg-card mt-8 rounded-2xl border p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-2xl font-bold">
              {{ event.isFree ? "Free" : `$${event.form?.price || "0"}` }}
            </p>
            <p class="text-muted-foreground mt-0.5 text-sm">
              {{ isPast ? "This event has passed" : "Secure your spot now" }}
            </p>
          </div>
          <div class="flex gap-3">
            <Button
              v-if="!isPast && event.form"
              :as="NuxtLink"
              :to="`/events/${slug}/register`"
              size="lg"
              class="px-8"
            >
              <Ticket class="mr-2 h-4 w-4" />
              {{ event.isFree ? "Register" : "Book tickets" }}
            </Button>
            <Badge v-else-if="isPast" variant="secondary" class="h-10 px-4 text-sm">
              Event has passed
            </Badge>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-10">
        <Tabs v-model="activeTab">
          <TabsList class="bg-muted/50 h-auto w-full justify-start rounded-full p-1">
            <TabsTrigger value="description" class="rounded-full px-6">Description</TabsTrigger>
            <TabsTrigger value="details" class="rounded-full px-6">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="description" class="mt-6">
            <div class="prose prose-neutral max-w-none">
              <p class="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {{ event.description || "No description available." }}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="details" class="mt-6">
            <div class="grid gap-4 sm:grid-cols-2">
              <div v-if="event.startDate" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Date
                </p>
                <p class="text-sm font-medium">{{ formatDate(event.startDate) }}</p>
                <p v-if="event.endDate" class="text-muted-foreground mt-0.5 text-xs">
                  to {{ formatDate(event.endDate) }}
                </p>
              </div>
              <div v-if="event.startDate" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Time
                </p>
                <p class="text-sm font-medium">
                  {{ formatTime(event.startDate) }}
                  <span v-if="event.endDate" class="text-muted-foreground">
                    — {{ formatTime(event.endDate) }}</span
                  >
                </p>
                <p v-if="event.timezone" class="text-muted-foreground mt-0.5 text-xs">
                  {{ event.timezone }}
                </p>
              </div>
              <div v-if="event.venueName" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Venue
                </p>
                <p class="text-sm font-medium">{{ event.venueName }}</p>
                <p v-if="event.venueAddress" class="text-muted-foreground mt-0.5 text-xs">
                  {{ event.venueAddress }}
                </p>
              </div>
              <div v-if="event.category" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Category
                </p>
                <p class="text-sm font-medium capitalize">{{ event.category }}</p>
              </div>
              <div v-if="event.contactPhone" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Contact
                </p>
                <a
                  :href="`tel:${event.contactPhone}`"
                  class="flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  <Phone class="h-3.5 w-3.5" />
                  {{ event.contactPhone }}
                </a>
              </div>
              <div v-if="event.contactEmail" class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Email
                </p>
                <a
                  :href="`mailto:${event.contactEmail}`"
                  class="flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  <Mail class="h-3.5 w-3.5" />
                  {{ event.contactEmail }}
                </a>
              </div>
              <div class="bg-card rounded-xl border p-4">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Price
                </p>
                <p class="text-sm font-medium">
                  {{ event.isFree ? "Free" : `$${event.form?.price || "0"}` }}
                </p>
              </div>
              <div v-if="event.refundPolicy" class="bg-card rounded-xl border p-4 sm:col-span-2">
                <p class="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Refund Policy
                </p>
                <p class="text-sm font-medium">{{ event.refundPolicy }}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Related Events -->
      <div v-if="relatedEvents.length" class="mt-16">
        <h2 class="mb-6 text-xl font-bold tracking-tight">You may be interested in</h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EventsEventCard
            v-for="related in relatedEvents"
            :key="related.id"
            :event="related as any"
          />
        </div>
      </div>
    </div>
  </div>
</template>
