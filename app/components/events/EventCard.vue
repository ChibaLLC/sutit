<script setup lang="ts">
import { Calendar, MapPin } from "lucide-vue-next";

const props = defineProps<{
  event: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    startDate: string;
    endDate?: string;
    venueName?: string;
    category?: string;
    images?: string[];
    isFree?: boolean;
    status?: string;
    form?: { price?: string };
  };
}>();

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-AU", {
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

const dayOfMonth = computed(() => {
  if (!props.event.startDate) return "";
  return new Date(props.event.startDate).getDate().toString();
});

const monthShort = computed(() => {
  if (!props.event.startDate) return "";
  return new Date(props.event.startDate).toLocaleDateString("en-AU", { month: "short" });
});
</script>

<template>
  <NuxtLink :to="`/events/${event.slug}`" class="group block">
    <div class="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/20">
      <!-- Image -->
      <div class="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          v-if="event.images?.[0]"
          :src="event.images[0]"
          :alt="event.title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div v-else class="flex h-full items-center justify-center">
          <Calendar class="text-muted-foreground/30 h-12 w-12" />
        </div>

        <!-- Date badge overlay -->
        <div v-if="event.startDate" class="absolute top-3 left-3 flex flex-col items-center rounded-lg bg-white/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm dark:bg-black/70">
          <span class="text-[10px] font-bold uppercase leading-none text-primary">{{ monthShort }}</span>
          <span class="text-lg font-bold leading-tight">{{ dayOfMonth }}</span>
        </div>

        <!-- Price badge -->
        <div class="absolute top-3 right-3">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm"
            :class="event.isFree ? 'bg-green-500/90 text-white' : 'bg-white/90 text-foreground dark:bg-black/70'"
          >
            {{ event.isFree ? "Free" : `$${event.form?.price || "0"}` }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <!-- Category -->
        <div class="mb-2">
          <span
            v-if="event.category"
            class="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize"
          >
            {{ event.category }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="mb-2 line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
          {{ event.title }}
        </h3>

        <!-- Meta -->
        <div class="space-y-1.5">
          <div class="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Calendar class="h-3.5 w-3.5 shrink-0" />
            <span>{{ formatDate(event.startDate) }}</span>
            <span v-if="event.endDate" class="text-muted-foreground/60">— {{ formatDate(event.endDate) }}</span>
          </div>
          <div v-if="event.venueName" class="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">{{ event.venueName }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
