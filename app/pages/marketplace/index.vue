<script setup lang="ts">
import {
  Search,
  X,
  Layers,
  DollarSign,
  CheckCircle2,
  LayoutGrid,
  List,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  FileText,
  Clock,
  Tag,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-vue-next";
import { buttonVariants } from "~/components/ui/button";
import type { Form, User } from "~~/shared/types";

interface Category {
  id: string;
  name: string;
  count: number;
}

// View mode
const viewMode = ref<"grid" | "list">("grid");

// Filters with reactive query
const filters = ref({
  search: "",
  priceRange: "all",
  sortBy: "popular",
  currentPage: 1,
  itemsPerPage: 27,
  categories: [] as string[],
});

// Selected categories
const selectedCategories = computed({
  get: () => filters.value.categories,
  set: (value) => {
    filters.value.categories = value;
  },
});

// Fetch data from API with auto-refresh on filter changes
const { data, pending, refresh } = await useFetch("/api/marketplace", {
  query: filters,
  watch: [filters],
  server: true,
  lazy: false,
});

// Computed values
const totalForms = computed(() => data.value?.count || 0);
const totalPages = computed(() =>
  Math.ceil(totalForms.value / filters.value.itemsPerPage),
);
const totalCategories = computed(() => categories.value.length);

// Categories derived from tags in the data
const categories = computed<Category[]>(() => {
  if (!data.value?.data) return [];

  const tagMap: Record<string, number> = {};

  data.value.data.forEach((form) => {
    if (form.tags && Array.isArray(form.tags)) {
      form.tags.forEach((tag: string) => {
        const normalizedTag = tag.toLowerCase().trim();
        tagMap[normalizedTag] = (tagMap[normalizedTag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagMap)
    .map(([tag, count]) => ({
      id: tag,
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);
});

// Price ranges based on actual data
const priceRanges = computed(() => {
  if (!data.value?.data || data.value.data.length === 0) {
    return [
      { id: "all", label: "All Prices" },
      { id: "free", label: "Free" },
    ];
  }

  const prices = data.value.data
    .map((form) => parseFloat(form.price || "0"))
    .filter((price: number) => !isNaN(price));

  if (prices.length === 0) {
    return [
      { id: "all", label: "All Prices" },
      { id: "free", label: "Free" },
    ];
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasFree = prices.some((p: number) => p === 0);

  // If all forms are free
  if (maxPrice === 0) {
    return [
      { id: "all", label: "All Prices" },
      { id: "free", label: "Free" },
    ];
  }

  // Calculate price ranges based on actual data
  const ranges = [{ id: "all", label: "All Prices" }];

  if (hasFree) {
    ranges.push({ id: "free", label: "Free" });
  }

  // Create ranges based on the price distribution
  const step = Math.ceil(maxPrice / 4);

  if (maxPrice > 0) {
    ranges.push(
      { id: "under-low", label: `Under Ksh ${step}` },
      { id: "under-mid", label: `Ksh ${step} - ${step * 2}` },
      { id: "under-high", label: `Ksh ${step * 2} - ${step * 3}` },
      { id: "premium", label: `Ksh ${step * 3}+` },
    );
  }

  return ranges;
});

// Visible pages for pagination
const visiblePages = computed(() => {
  const current = filters.value.currentPage;
  const total = totalPages.value;
  const pages: number[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); // Ellipsis
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push(-1); // Ellipsis
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1); // Ellipsis
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push(-1); // Ellipsis
      pages.push(total);
    }
  }

  return pages;
});

// Check if filters are active
const hasActiveFilters = computed(() => {
  return (
    filters.value.search !== "" ||
    filters.value.priceRange !== "all" ||
    selectedCategories.value.length > 0
  );
});

// Debounced search
let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.currentPage = 1;
  }, 300);
};

// Methods
const toggleCategory = (categoryId: string) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }
  filters.value.currentPage = 1;
};

const clearSearch = () => {
  filters.value.search = "";
  filters.value.currentPage = 1;
};

const clearFilters = () => {
  filters.value = {
    search: "",
    priceRange: "all",
    sortBy: "popular",
    currentPage: 1,
    itemsPerPage: 9,
    categories: [],
  };
};

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const selectPriceRange = (priceId: string) => {
  filters.value.priceRange = priceId;
  filters.value.currentPage = 1;
};

// Watch page changes and scroll to top
watch(
  () => filters.value.currentPage,
  () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
);

// SEO Meta
useHead({
  title: "Marketplace - Discover Public Forms | SUTIT Forms",
  meta: [
    {
      name: "description",
      content:
        "Browse through our curated collection of public forms. Find the perfect form template for your needs.",
    },
    {
      property: "og:title",
      content: "Marketplace - SUTIT Forms",
    },
    {
      property: "og:description",
      content: "Discover amazing public forms created by the community",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section class="relative py-16 overflow-hidden border-b border-border">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
      ></div>
      <div class="container mx-auto px-4 relative">
        <div class="max-w-3xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 hover:bg-primary/20 transition-colors cursor-default"
          >
            <ShoppingBag class="w-4 h-4 animate-pulse" />
            <span class="text-sm font-medium">Public Forms Marketplace</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span
              class="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient"
            >
              Discover Amazing Forms
            </span>
          </h1>
          <p class="text-lg md:text-xl text-muted-foreground mb-6">
            Browse through our curated collection of public forms created by the
            community
          </p>

          <!-- Quick Stats -->
          <div class="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div class="flex items-center gap-2 group cursor-default">
              <div
                class="w-2 h-2 rounded-full bg-primary animate-pulse group-hover:scale-125 transition-transform"
              ></div>
              <span class="text-muted-foreground font-medium"
                >{{ totalForms }}+ Forms</span
              >
            </div>
            <div class="w-px h-4 bg-border"></div>
            <div class="flex items-center gap-2 group cursor-default">
              <div
                class="w-2 h-2 rounded-full bg-chart-3 animate-pulse group-hover:scale-125 transition-transform"
              ></div>
              <span class="text-muted-foreground font-medium"
                >{{ totalCategories }}+ Categories</span
              >
            </div>
            <div class="w-px h-4 bg-border"></div>
            <div class="flex items-center gap-2 group cursor-default">
              <div
                class="w-2 h-2 rounded-full bg-chart-4 animate-pulse group-hover:scale-125 transition-transform"
              ></div>
              <span class="text-muted-foreground font-medium"
                >All Free to Use</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-muted-foreground">Loading amazing forms...</p>
        </div>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Filters -->
        <aside class="lg:w-80 flex-shrink-0">
          <div class="sticky top-4 space-y-4">
            <!-- Search -->
            <Card class="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <Search class="w-4 h-4 text-primary" />
                  Search Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    v-model="filters.search"
                    placeholder="Search by name or tag..."
                    class="pl-10 pr-10"
                    @input="debouncedSearch"
                  />
                  <Button
                    v-if="filters.search"
                    variant="ghost"
                    size="sm"
                    class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                    @click="clearSearch"
                  >
                    <X class="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Categories -->
            <Card class="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <Layers class="w-4 h-4 text-primary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea class="h-[300px] pr-4">
                  <div class="space-y-2">
                    <button
                      v-for="category in categories"
                      :key="category.id"
                      @click="toggleCategory(category.id)"
                      class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
                      :class="
                        selectedCategories.includes(category.id)
                          ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                          : 'bg-muted/30 hover:bg-muted hover:scale-[1.01] text-foreground'
                      "
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      ></div>
                      <div class="flex items-center gap-3 relative z-10">
                        <div
                          class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                          :class="
                            selectedCategories.includes(category.id)
                              ? 'bg-primary-foreground/20'
                              : 'bg-primary/10'
                          "
                        >
                          <Tag
                            class="w-4 h-4"
                            :class="
                              selectedCategories.includes(category.id)
                                ? 'text-primary-foreground'
                                : 'text-primary'
                            "
                          />
                        </div>
                        <span class="text-sm font-medium">{{
                          category.name
                        }}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        class="text-xs relative z-10 transition-colors"
                        :class="
                          selectedCategories.includes(category.id)
                            ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                            : 'border-border'
                        "
                      >
                        {{ category.count }}
                      </Badge>
                    </button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <!-- Price Range -->
            <Card class="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <DollarSign class="w-4 h-4 text-primary" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <button
                    v-for="price in priceRanges"
                    :key="price.id"
                    @click="selectPriceRange(price.id)"
                    class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
                    :class="
                      filters.priceRange === price.id
                        ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                        : 'bg-muted/30 hover:bg-muted hover:scale-[1.01] text-foreground'
                    "
                  >
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    ></div>
                    <span class="text-sm font-medium relative z-10">{{
                      price.label
                    }}</span>
                    <CheckCircle2
                      v-if="filters.priceRange === price.id"
                      class="w-4 h-4 relative z-10 animate-in zoom-in-50 duration-200"
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Sort Options -->
            <Card class="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <ArrowUpDown class="w-4 h-4 text-primary" />
                  Sort By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select v-model="filters.sortBy">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      <div class="flex items-center gap-2">
                        <TrendingUp class="w-4 h-4" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div class="flex items-center gap-2">
                        <Clock class="w-4 h-4" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">
                      <div class="flex items-center gap-2">
                        <ArrowUp class="w-4 h-4" />
                        Price: Low to High
                      </div>
                    </SelectItem>
                    <SelectItem value="price-high">
                      <div class="flex items-center gap-2">
                        <ArrowDown class="w-4 h-4" />
                        Price: High to Low
                      </div>
                    </SelectItem>
                    <SelectItem value="title">
                      <div class="flex items-center gap-2">
                        <FileText class="w-4 h-4" />
                        Title A-Z
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <!-- Clear Filters -->
            <Button
              variant="outline"
              class="w-full group hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
              @click="clearFilters"
              v-if="hasActiveFilters"
            >
              <X
                class="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform"
              />
              Clear All Filters
            </Button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <!-- Toolbar -->
          <div class="mb-6">
            <Card class="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent class="p-4">
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      class="text-sm font-medium px-3 py-1"
                    >
                      {{ totalForms }}
                      {{ totalForms === 1 ? "form" : "forms" }} found
                    </Badge>
                    <TransitionGroup name="badge">
                      <Badge
                        v-for="cat in selectedCategories"
                        :key="cat"
                        variant="outline"
                        class="text-xs pl-2 pr-1 py-1 gap-1 hover:bg-destructive/10 hover:border-destructive transition-colors"
                      >
                        {{ categories.find((c) => c.id === cat)?.name }}
                        <button
                          @click="toggleCategory(cat)"
                          class="ml-1 hover:text-destructive transition-colors rounded-sm hover:bg-destructive/20 p-0.5"
                        >
                          <X class="w-3 h-3" />
                        </button>
                      </Badge>
                    </TransitionGroup>
                  </div>

                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <div
                      class="flex border border-border rounded-lg overflow-hidden shadow-sm"
                    >
                      <button
                        @click="viewMode = 'grid'"
                        class="p-2 transition-all duration-200"
                        :class="
                          viewMode === 'grid'
                            ? 'bg-primary text-primary-foreground shadow-inner'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        "
                      >
                        <LayoutGrid class="w-4 h-4" />
                      </button>
                      <div class="w-px bg-border"></div>
                      <button
                        @click="viewMode = 'list'"
                        class="p-2 transition-all duration-200"
                        :class="
                          viewMode === 'list'
                            ? 'bg-primary text-primary-foreground shadow-inner'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        "
                      >
                        <List class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Forms Grid View -->
          <TransitionGroup
            v-if="viewMode === 'grid'"
            name="list"
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
          >
            <Card
              v-for="form in data?.data"
              :key="form.id"
              class="group pt-0 border-border/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <!-- Image/Preview -->
              <div
                class="relative h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden"
              >
                <div
                  class="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                >
                  <FileText class="w-20 h-20 text-primary/20" />
                </div>
                <div
                  class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>

                <div class="absolute top-3 right-3 flex gap-2">
                  <Badge
                    v-if="parseFloat(form.price) === 0"
                    class="bg-chart-3 hover:bg-chart-3 shadow-lg"
                  >
                    <Sparkles class="w-3 h-3 mr-1" />
                    Free
                  </Badge>
                </div>

                <div class="absolute bottom-3 left-3">
                  <Badge
                    variant="secondary"
                    class="text-xs backdrop-blur-sm bg-background/80 shadow-md"
                  >
                    {{ form.tags[0] || "General" }}
                  </Badge>
                </div>
              </div>

              <CardHeader class="pb-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <CardTitle
                      class="text-lg font-bold truncate group-hover:text-primary transition-colors"
                    >
                      {{ form.title }}
                    </CardTitle>
                    <CardDescription class="text-sm mt-1 line-clamp-2">
                      {{ form.description || "No description provided" }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent class="pt-0 space-y-4">
                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in form.tags.slice(0, 3)"
                    :key="tag"
                    variant="outline"
                    class="text-xs hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    {{ tag }}
                  </Badge>
                  <Badge
                    v-if="form.tags.length > 3"
                    variant="outline"
                    class="text-xs"
                  >
                    +{{ form.tags.length - 3 }}
                  </Badge>
                </div>

                <!-- Creator -->
                <div
                  class="flex items-center gap-2 pt-2 border-t border-border"
                >
                  <Avatar class="w-6 h-6 ring-2 ring-border">
                    <AvatarImage :src="form.creator?.image || ''" />
                    <AvatarFallback
                      class="text-xs bg-primary/10 text-primary font-semibold"
                    >
                      {{ getInitials(form.creator?.name || "Anonymous") }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="text-xs text-muted-foreground truncate">
                    {{ form.creator?.name || "Anonymous" }}
                  </span>
                  <div
                    class="ml-auto flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <Clock class="w-3 h-3" />
                    <span>{{ formatDate(form.createdAt) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-2">
                  <NuxtLink
                    :to="`/forms/${form.slug}`"
                    :class="
                      buttonVariants({ size: 'sm', class: 'flex-1 group' })
                    "
                  >
                    <Eye
                      class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                    />
                    View Form
                  </NuxtLink>
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex-1 font-semibold"
                  >
                    {{
                      parseFloat(form.price) === 0
                        ? "Free"
                        : `Ksh ${parseFloat(form.price).toFixed(2)}`
                    }}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TransitionGroup>

          <!-- List View -->
          <TransitionGroup v-else name="list" tag="div" class="space-y-4 mb-8">
            <Card
              v-for="form in data?.data"
              :key="form.id"
              class="border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              <CardContent class="p-6">
                <div class="flex flex-col sm:flex-row gap-6">
                  <!-- Preview -->
                  <div
                    class="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                    >
                      <FileText class="w-16 h-16 text-primary/20" />
                    </div>
                    <div class="absolute top-2 right-2">
                      <Badge
                        v-if="parseFloat(form.price) === 0"
                        class="bg-chart-3 hover:bg-chart-3 text-xs shadow-md"
                      >
                        Free
                      </Badge>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0 space-y-3">
                    <div>
                      <div class="flex items-start justify-between gap-4 mb-2">
                        <h3
                          class="text-xl font-bold hover:text-primary transition-colors group-hover:text-primary"
                        >
                          {{ form.title }}
                        </h3>
                        <Badge variant="secondary" class="shrink-0">{{
                          form.tags[0] || "General"
                        }}</Badge>
                      </div>
                      <p class="text-sm text-muted-foreground line-clamp-2">
                        {{ form.description || "No description provided" }}
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-1">
                      <Badge
                        v-for="tag in form.tags.slice(0, 5)"
                        :key="tag"
                        variant="outline"
                        class="text-xs"
                      >
                        {{ tag }}
                      </Badge>
                    </div>

                    <div
                      class="flex items-center justify-between pt-2 border-t border-border"
                    >
                      <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-2">
                          <Avatar class="w-6 h-6 ring-2 ring-border">
                            <AvatarImage :src="form.creator?.image || ''" />
                            <AvatarFallback
                              class="text-xs bg-primary/10 text-primary"
                            >
                              {{ getInitials(form.creator?.name || "A") }}
                            </AvatarFallback>
                          </Avatar>
                          <span class="text-xs text-muted-foreground">{{
                            form.creator?.name || "Anonymous"
                          }}</span>
                        </div>
                        <div
                          class="flex items-center gap-1 text-muted-foreground"
                        >
                          <Clock class="w-3 h-3" />
                          <span class="text-xs">{{
                            formatDate(form.createdAt)
                          }}</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <NuxtLink
                          :to="`/forms/${form.slug}`"
                          :class="buttonVariants({ size: 'sm' })"
                        >
                          <Eye class="w-4 h-4 mr-2" />
                          View
                        </NuxtLink>
                        <Button
                          variant="outline"
                          size="sm"
                          class="font-semibold"
                        >
                          {{
                            parseFloat(form.price) === 0
                              ? "Free"
                              : `Ksh ${parseFloat(form.price).toFixed(2)}`
                          }}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TransitionGroup>

          <!-- Empty State -->
          <Card
            v-if="!pending && (!data?.data || data.data.length === 0)"
            class="border-dashed border-2"
          >
            <CardContent
              class="flex flex-col items-center justify-center py-20"
            >
              <div
                class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"
              >
                <Search class="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 class="text-2xl font-bold mb-2">No forms found</h3>
              <p class="text-muted-foreground text-center mb-6 max-w-md">
                We couldn't find any forms matching your criteria. Try adjusting
                your filters or search terms.
              </p>
              <Button @click="clearFilters" class="group">
                <X
                  class="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform"
                />
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="filters.currentPage--"
                :disabled="filters.currentPage === 1"
                class="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft class="w-4 h-4" />
              </Button>

              <div class="flex items-center gap-1">
                <Button
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="
                    page === filters.currentPage ? 'default' : 'outline'
                  "
                  size="sm"
                  @click="filters.currentPage = page"
                  class="w-10 transition-all"
                  :class="
                    page === filters.currentPage
                      ? 'scale-110'
                      : 'hover:scale-105'
                  "
                >
                  {{ page }}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                @click="filters.currentPage++"
                :disabled="filters.currentPage === totalPages"
                class="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* List transition animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Badge transition animations */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.2s ease;
}

.badge-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.badge-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Gradient animation */
@keyframes gradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 3s ease infinite;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
