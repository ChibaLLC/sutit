<script setup lang="ts">
  import {
    FileText,
    ShoppingBag,
    Banknote,
    Gift,
    Link2,
    Layers,
    Package,
    Shield,
    Send,
    Check,
    Calendar,
    Clock,
    MapPin,
    Users,
    Ticket,
    Tag,
  } from "lucide-vue-next";
  import type { PageSchema, Store, EventSchema } from "~~/shared/types";

  const props = defineProps<{
    name: string;
    slug: string;
    description: string;
    formType: "regular" | "product";
    isPaid: boolean;
    price: number;
    pages: PageSchema[];
    stores: Store[];
    isPublic: boolean;
    requiresLogin: boolean;
    allowMultipleSubmissions: boolean;
    submissionLimit: number | null;
    hasEvent: boolean;
    event?: EventSchema | null;
  }>();

  const totalFields = props.pages.reduce((sum, p) => sum + p.fields.length, 0);
  const totalProducts = props.stores.reduce((sum, p) => sum + p.items.length, 0);

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
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-8 space-y-2 text-center">
      <h2 class="text-2xl font-bold tracking-tight">Review & create</h2>
      <p class="text-muted-foreground">Everything ready? Create your form</p>
    </div>

    <div class="space-y-4">
      <!-- Basic Info -->
      <Card>
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div
              class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            >
              <FileText class="text-primary h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">{{ name || "Untitled form" }}</p>
              <div class="mt-1 flex items-center gap-2">
                <Link2 class="text-muted-foreground h-3 w-3" />
                <span class="text-muted-foreground font-mono text-xs">/forms/{{ slug }}</span>
              </div>
              <p v-if="description" class="text-muted-foreground mt-2 line-clamp-2 text-sm">
                {{ description }}
              </p>
            </div>
            <Badge variant="outline">
              {{ hasEvent ? "Event" : formType === "product" ? "Product" : "Regular" }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <!-- Event Details -->
      <Card v-if="hasEvent && event">
        <CardContent class="p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Calendar class="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p class="text-sm font-medium">Event Details</p>
              <p class="text-muted-foreground text-xs">{{ event.title || name }}</p>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-if="event.startDate" class="flex items-center gap-2 text-sm">
              <Calendar class="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{{ formatDate(event.startDate) }}</span>
              <span v-if="event.endDate"> — {{ formatDate(event.endDate) }}</span>
            </div>
            <div v-if="event.startDate" class="flex items-center gap-2 text-sm">
              <Clock class="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{{ formatTime(event.startDate) }}</span>
              <span v-if="event.endDate"> — {{ formatTime(event.endDate) }}</span>
            </div>
            <div v-if="event.venueName" class="flex items-center gap-2 text-sm">
              <MapPin class="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{{ event.venueName }}</span>
            </div>
            <div v-if="event.category" class="flex items-center gap-2 text-sm">
              <Tag class="text-muted-foreground h-4 w-4 shrink-0" />
              <span class="capitalize">{{ event.category }}</span>
            </div>
            <div v-if="event.audience" class="flex items-center gap-2 text-sm">
              <Users class="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{{ event.audience }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Ticket class="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{{ event.isFree ? "Free event" : "Paid event" }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Fields & Pages -->
      <Card>
        <CardContent class="p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Layers class="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p class="text-sm font-medium">Pages & Fields</p>
              <p class="text-muted-foreground text-xs">
                {{ pages.length }} page{{ pages.length !== 1 ? "s" : "" }},
                {{ totalFields }} field{{ totalFields !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="(page, index) in pages"
              :key="page.id"
              class="bg-muted/30 flex items-center gap-3 rounded-lg p-2"
            >
              <span class="text-muted-foreground w-5 text-xs font-medium">{{ index + 1 }}</span>
              <span class="flex-1 text-sm font-medium">{{ page.title }}</span>
              <Badge variant="secondary" class="text-[10px]">
                {{ page.fields.length }} field{{ page.fields.length !== 1 ? "s" : "" }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Products (if product form) -->
      <Card v-if="formType === 'product'">
        <CardContent class="p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <ShoppingBag class="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p class="text-sm font-medium">Stores & Products</p>
              <p class="text-muted-foreground text-xs">
                {{ stores.length }} store{{ stores.length !== 1 ? "s" : "" }},
                {{ totalProducts }} product{{ totalProducts !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="store in stores"
              :key="store.id"
              class="bg-muted/30 flex items-center gap-3 rounded-lg p-2"
            >
              <Package class="text-muted-foreground h-4 w-4" />
              <span class="flex-1 text-sm font-medium">{{ store.name }}</span>
              <Badge variant="secondary" class="text-[10px]">
                {{ store.items.length }} product{{ store.items.length !== 1 ? "s" : "" }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pricing -->
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              <component
                :is="hasEvent ? (event?.isFree ? Gift : Banknote) : (isPaid ? Banknote : Gift)"
                class="h-4 w-4"
                :class="(hasEvent ? event?.isFree : !isPaid) ? 'text-muted-foreground' : 'text-green-600'"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Pricing</p>
              <p class="text-sm font-semibold">
                <template v-if="hasEvent">
                  {{ event?.isFree ? "Free" : "Paid event" }}
                </template>
                <template v-else>
                  {{ isPaid ? `KES ${price.toLocaleString()}` : "Free" }}
                </template>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Settings Summary -->
      <Card>
        <CardContent class="p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              <Shield class="text-muted-foreground h-4 w-4" />
            </div>
            <p class="text-sm font-medium">Settings</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge v-if="isPublic" variant="secondary">
              <Check class="mr-1 h-3 w-3" /> Public
            </Badge>
            <Badge v-if="requiresLogin" variant="secondary">
              <Check class="mr-1 h-3 w-3" /> Login required
            </Badge>
            <Badge v-if="allowMultipleSubmissions" variant="secondary">
              <Check class="mr-1 h-3 w-3" /> Multiple submissions
            </Badge>
            <Badge v-if="submissionLimit" variant="secondary"> Limit: {{ submissionLimit }} </Badge>
            <Badge
              v-if="!isPublic && !requiresLogin && !allowMultipleSubmissions && !submissionLimit"
              variant="outline"
            >
              Default settings
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
