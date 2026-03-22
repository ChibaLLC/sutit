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
} from "lucide-vue-next";
import type { PageSchema, Store } from "~~/shared/types";

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
}>();

const totalFields = props.pages.reduce((sum, p) => sum + p.fields.length, 0);
const totalProducts = props.stores.reduce((sum, s) => sum + s.items.length, 0);
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="text-center space-y-2 mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Review & create</h2>
      <p class="text-muted-foreground">Everything ready? Create your form</p>
    </div>

    <div class="space-y-4">
      <!-- Basic Info -->
      <Card>
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ name || "Untitled form" }}</p>
              <div class="flex items-center gap-2 mt-1">
                <Link2 class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs font-mono text-muted-foreground">/forms/{{ slug }}</span>
              </div>
              <p v-if="description" class="text-sm text-muted-foreground mt-2 line-clamp-2">
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
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Layers class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p class="text-sm font-medium">Pages & Fields</p>
              <p class="text-xs text-muted-foreground">
                {{ pages.length }} page{{ pages.length !== 1 ? "s" : "" }}, {{ totalFields }} field{{ totalFields !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="(page, index) in pages"
              :key="page.id"
              class="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
            >
              <span class="text-xs font-medium text-muted-foreground w-5">{{ index + 1 }}</span>
              <span class="text-sm font-medium flex-1">{{ page.title }}</span>
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
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ShoppingBag class="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p class="text-sm font-medium">Stores & Products</p>
              <p class="text-xs text-muted-foreground">
                {{ stores.length }} store{{ stores.length !== 1 ? "s" : "" }}, {{ totalProducts }} product{{ totalProducts !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="store in stores"
              :key="store.id"
              class="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
            >
              <Package class="w-4 h-4 text-muted-foreground" />
              <span class="text-sm font-medium flex-1">{{ store.name }}</span>
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
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <component
                :is="isPaid ? Banknote : Gift"
                class="w-4 h-4"
                :class="isPaid ? 'text-green-600' : 'text-muted-foreground'"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">Pricing</p>
              <p class="text-sm font-semibold">
                {{ isPaid ? `KES ${price.toLocaleString()}` : "Free" }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Settings Summary -->
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Shield class="w-4 h-4 text-muted-foreground" />
            </div>
            <p class="text-sm font-medium">Settings</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge v-if="isPublic" variant="secondary">
              <Check class="w-3 h-3 mr-1" /> Public
            </Badge>
            <Badge v-if="requiresLogin" variant="secondary">
              <Check class="w-3 h-3 mr-1" /> Login required
            </Badge>
            <Badge v-if="allowMultipleSubmissions" variant="secondary">
              <Check class="w-3 h-3 mr-1" /> Multiple submissions
            </Badge>
            <Badge v-if="submissionLimit" variant="secondary">
              Limit: {{ submissionLimit }}
            </Badge>
            <Badge v-if="!isPublic && !requiresLogin && !allowMultipleSubmissions && !submissionLimit" variant="outline">
              Default settings
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
