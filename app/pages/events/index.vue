<script setup lang="ts">
  import { Calendar, Search, X } from "lucide-vue-next";

  const search = ref("");
  const selectedCategory = ref("");
  const selectedStatus = ref("upcoming");

  const categories = [
    "workshop",
    "show",
    "exhibition",
    "conference",
    "meetup",
    "performance",
    "seminar",
  ];

  const query = computed(() => ({
    limit: 20,
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
    ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
    ...(search.value ? { search: search.value } : {}),
  }));

  const { data: eventsData, pending } = await useFetch("/api/events", {
    query,
  });

  const events = computed(() => eventsData.value?.data || []);
  const totalCount = computed(() => eventsData.value?.total ?? 0);

  const hasActiveFilters = computed(() => search.value || selectedCategory.value);

  const clearFilters = () => {
    search.value = "";
    selectedCategory.value = "";
  };

  useSeoMeta({
    title: "Events",
    description: "Discover upcoming events, workshops, shows, and experiences",
  });
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Compact header + filters -->
    <div class="border-b bg-background">
      <div class="mx-auto max-w-6xl px-6 py-6">
        <!-- Title row -->
        <div class="mb-4 flex items-end justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Events</h1>
            <p class="text-muted-foreground mt-0.5 text-sm">
              {{ totalCount }} event{{ totalCount !== 1 ? "s" : "" }}
            </p>
          </div>
        </div>

        <!-- Search + status tabs in one row -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-sm">
            <Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              v-model="search"
              placeholder="Search..."
              class="pl-9 h-9 text-sm"
            />
          </div>

          <div class="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            <button
              @click="selectedStatus = ''"
              class="rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="!selectedStatus ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
              All
            </button>
            <button
              @click="selectedStatus = selectedStatus === 'upcoming' ? '' : 'upcoming'"
              class="rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="selectedStatus === 'upcoming' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
              Upcoming
            </button>
            <button
              @click="selectedStatus = selectedStatus === 'ongoing' ? '' : 'ongoing'"
              class="rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="selectedStatus === 'ongoing' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
              Now
            </button>
            <button
              @click="selectedStatus = selectedStatus === 'past' ? '' : 'past'"
              class="rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="selectedStatus === 'past' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
              Past
            </button>
          </div>
        </div>

        <!-- Category pills -->
        <div class="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            @click="selectedCategory = ''"
            class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            :class="!selectedCategory ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'"
          >
            All
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = selectedCategory === cat ? '' : cat"
            class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize"
            :class="selectedCategory === cat ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Active filter chip -->
        <div v-if="hasActiveFilters" class="mt-3 flex items-center gap-2">
          <span class="text-muted-foreground text-xs">Filtered</span>
          <button
            @click="clearFilters"
            class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            Clear all
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Events Grid -->
    <div class="mx-auto max-w-6xl px-6 py-6">
      <!-- Loading skeleton -->
      <div v-if="pending" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="overflow-hidden rounded-xl border">
          <div class="bg-muted aspect-[16/10]" />
          <div class="p-4 space-y-3">
            <div class="bg-muted h-4 w-20 rounded-full" />
            <div class="bg-muted h-5 w-3/4 rounded" />
            <div class="space-y-1.5">
              <div class="bg-muted h-4 w-1/2 rounded" />
              <div class="bg-muted h-4 w-1/3 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Events grid -->
      <div v-else-if="events.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <EventsEventCard v-for="ev in events" :key="ev.id" :event="ev as any" />
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="bg-muted mb-3 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Calendar class="text-muted-foreground h-7 w-7" />
        </div>
        <h3 class="mb-1 text-base font-semibold">
          {{ hasActiveFilters ? "No events match your filters" : "No events yet" }}
        </h3>
        <p class="text-muted-foreground mb-4 text-sm max-w-xs">
          {{
            hasActiveFilters
              ? "Try adjusting your search or removing some filters"
              : "Check back soon for upcoming events"
          }}
        </p>
        <Button v-if="hasActiveFilters" variant="outline" size="sm" @click="clearFilters">
          Clear filters
        </Button>
      </div>
    </div>
  </div>
</template>
