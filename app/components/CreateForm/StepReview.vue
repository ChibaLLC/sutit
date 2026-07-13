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
    Smartphone,
    StoreIcon,
    Building2Icon,
  } from "lucide-vue-next";
  import { computed } from "vue";
  import type { FormPayoutMethod, PageSchema, Store } from "~~/shared/types";

  const props = defineProps<{
    name: string;
    slug: string;
    description: string;
    formType: "regular" | "product";
    isPaid: boolean;
    price: number;
    payoutMethod?: FormPayoutMethod | null;
    payoutPhone?: string | null;
    payoutTill?: string | null;
    payoutPaybill?: string | null;
    payoutAccountNumber?: string | null;
    pages: PageSchema[];
    stores: Store[];
    isPublic: boolean;
    requiresLogin: boolean;
    allowMultipleSubmissions: boolean;
    submissionLimit: number | null;
  }>();

  const totalFields = props.pages.reduce((sum, p) => sum + p.fields.length, 0);
  const totalProducts = props.stores.reduce((sum, s) => sum + s.items.length, 0);

  const payoutSummary = computed(() => {
    if (!props.payoutMethod) return null;
    if (props.payoutMethod === "phone")
      return {
        icon: Smartphone,
        label: "M-Pesa",
        detail: props.payoutPhone,
        badge: "B2C",
      };
    if (props.payoutMethod === "till")
      return {
        icon: StoreIcon,
        label: "Till",
        detail: props.payoutTill,
        badge: "B2B",
      };
    if (props.payoutMethod === "paybill")
      return {
        icon: Building2Icon,
        label: "Paybill",
        detail: `${props.payoutPaybill} · Acc ${props.payoutAccountNumber}`,
        badge: "B2B",
      };
    return null;
  });
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
              {{ formType === "product" ? "Product" : "Regular" }}
            </Badge>
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
                :is="isPaid ? Banknote : Gift"
                class="h-4 w-4"
                :class="isPaid ? 'text-green-600' : 'text-muted-foreground'"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Pricing</p>
              <p class="text-sm font-semibold">
                {{ isPaid ? `KES ${price.toLocaleString()}` : "Free" }}
              </p>
              <div v-if="payoutSummary" class="mt-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <component :is="payoutSummary.icon" class="h-3.5 w-3.5 text-primary" />
                </div>
                <span class="text-muted-foreground text-xs">
                  {{ payoutSummary.label }}
                  <span class="font-medium text-foreground/80">{{ payoutSummary.detail }}</span>
                </span>
                <Badge variant="secondary" class="ml-auto text-[10px] font-medium">
                  {{ payoutSummary.badge }}
                </Badge>
              </div>
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
