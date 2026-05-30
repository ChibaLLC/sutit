<script setup lang="ts">
import { Calendar, Clock, MapPin, Phone, Plus, Trash2, Image as ImageIcon, ShoppingBag } from "lucide-vue-next";
import { ref, watch } from "vue";
import type { EventSchema } from "~~/shared/types";

const props = defineProps<{
  event: EventSchema;
  requireMerch: boolean;
}>();

const emit = defineEmits<{
  "update:event": [event: EventSchema];
  "update:requireMerch": [value: boolean];
}>();

const localEvent = ref<EventSchema>({ ...props.event });

watch(() => props.event, (v) => { localEvent.value = { ...v }; }, { deep: true });

const emitUpdate = () => {
  emit("update:event", { ...localEvent.value });
};

const categories = [
  "workshop",
  "show",
  "exhibition",
  "conference",
  "meetup",
  "performance",
  "seminar",
  "other",
];

const timezones = [
  "UTC",
  "Africa/Nairobi",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const newImageUrl = ref("");

const addImage = () => {
  if (newImageUrl.value.trim()) {
    const images = [...(localEvent.value.images || []), newImageUrl.value.trim()];
    localEvent.value = { ...localEvent.value, images };
    newImageUrl.value = "";
    emitUpdate();
  }
};

const removeImage = (index: number) => {
  const images = (localEvent.value.images || []).filter((_, i) => i !== index);
  localEvent.value = { ...localEvent.value, images };
  emitUpdate();
};
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="space-y-8">
      <div class="space-y-2 text-center">
        <div class="bg-primary/10 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl">
          <Calendar class="text-primary h-6 w-6" />
        </div>
        <h2 class="text-2xl font-bold tracking-tight">Event Details</h2>
        <p class="text-muted-foreground">Fill in the details for your event</p>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="event-title">Event title</Label>
            <Input
              id="event-title"
              v-model="localEvent.title"
              @blur="emitUpdate"
              placeholder="e.g. The Big Sing - Take 2"
            />
          </div>
          <div class="space-y-2">
            <Label for="event-description">
              Description <span class="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="event-description"
              v-model="localEvent.description"
              @blur="emitUpdate"
              placeholder="Describe your event..."
              rows="4"
              class="resize-none"
            />
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="flex items-center gap-2 text-sm font-semibold">
            <Clock class="h-4 w-4" /> Date & Time
          </h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="event-start">Start date & time</Label>
              <Input
                id="event-start"
                v-model="localEvent.startDate"
                @blur="emitUpdate"
                type="datetime-local"
              />
            </div>
            <div class="space-y-2">
              <Label for="event-end">
                End date & time <span class="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-end"
                v-model="localEvent.endDate"
                @blur="emitUpdate"
                type="datetime-local"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="event-timezone">Timezone</Label>
            <Select v-model="localEvent.timezone" @update:model-value="emitUpdate">
              <SelectTrigger id="event-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tz in timezones" :key="tz" :value="tz">
                  {{ tz }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="flex items-center gap-2 text-sm font-semibold">
            <MapPin class="h-4 w-4" /> Venue
          </h3>
          <div class="space-y-2">
            <Label for="event-venue">Venue name</Label>
            <Input
              id="event-venue"
              v-model="localEvent.venueName"
              @blur="emitUpdate"
              placeholder="e.g. Shalom College Performing Arts Complex"
            />
          </div>
          <div class="space-y-2">
            <Label for="event-address">Venue address</Label>
            <Textarea
              id="event-address"
              v-model="localEvent.venueAddress"
              @blur="emitUpdate"
              placeholder="Full address of the venue..."
              rows="2"
              class="resize-none"
            />
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="flex items-center gap-2 text-sm font-semibold">
            <Phone class="h-4 w-4" /> Contact Information
          </h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="event-phone">
                Phone <span class="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-phone"
                v-model="localEvent.contactPhone"
                @blur="emitUpdate"
                placeholder="1300 707 655"
              />
            </div>
            <div class="space-y-2">
              <Label for="event-email">
                Email <span class="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-email"
                v-model="localEvent.contactEmail"
                @blur="emitUpdate"
                type="email"
                placeholder="info@example.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="text-sm font-semibold">Event Details</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="event-category">Category</Label>
              <Select v-model="localEvent.category" @update:model-value="emitUpdate">
                <SelectTrigger id="event-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="cat in categories" :key="cat" :value="cat">
                    {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="event-audience">
                Audience <span class="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="event-audience"
                v-model="localEvent.audience"
                @blur="emitUpdate"
                placeholder="e.g. Ages 16+, All ages"
              />
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <Switch :checked="localEvent.isFree" @update:checked="(v: boolean) => { localEvent = { ...localEvent, isFree: v }; emitUpdate(); }" id="event-free" />
              <Label for="event-free">Free event</Label>
            </div>
            <div class="flex items-center gap-2">
              <Switch :checked="requireMerch" @update:checked="emit('update:requireMerch', $event)" id="event-merch" />
              <div>
                <Label for="event-merch" class="cursor-pointer">Sell merchandise</Label>
                <p class="text-muted-foreground text-xs">Add a store with products, merch, or add-ons</p>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="event-refund">
              Refund policy <span class="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="event-refund"
              v-model="localEvent.refundPolicy"
              @blur="emitUpdate"
              placeholder="e.g. Refunds available up to 1 day prior to the event"
              rows="2"
              class="resize-none"
            />
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon class="h-4 w-4" /> Event Images
          </h3>
          <p class="text-muted-foreground text-sm">Add images to showcase your event</p>

          <div v-if="localEvent.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div v-for="(img, i) in localEvent.images" :key="i" class="group relative aspect-video overflow-hidden rounded-lg border">
              <img :src="img" :alt="`Event image ${i + 1}`" class="h-full w-full object-cover" />
              <button
                @click="removeImage(i)"
                class="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>

          <div class="flex gap-2">
            <Input
              v-model="newImageUrl"
              @keydown.enter="addImage"
              placeholder="Paste image URL..."
              class="flex-1"
            />
            <Button variant="outline" size="sm" @click="addImage" :disabled="!newImageUrl?.trim()">
              <Plus class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
