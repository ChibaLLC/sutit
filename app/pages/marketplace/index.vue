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
    Filter,
    Star,
  } from "lucide-vue-next";
  import type { Form, User } from "~~/shared/types";

  import { buttonVariants } from "~/components/ui/button";

  interface Category {
    id: string;
    name: string;
    count: number;
  }

  // View mode
  const viewMode = ref<"grid" | "list">("grid");

  // Mobile filters collapsible
  const filtersOpen = ref(false);

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
  const { data, pending } = await useFetch("/api/marketplace", {
    query: filters,
    watch: [filters],
    server: true,
    lazy: false,
  });

  // Computed values
  const totalForms = computed(() => data.value?.count || 0);
  const totalPages = computed(() => Math.ceil(totalForms.value / filters.value.itemsPerPage));
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
          "Browse through our curated collection of public forms. Find the perfect form template for your needs with advanced filtering and search.",
      },
      {
        name: "keywords",
        content: "forms, templates, registration, surveys, marketplace, public forms, form builder",
      },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large",
      },
      {
        property: "og:title",
        content: "Marketplace - Discover Public Forms | SUTIT Forms",
      },
      {
        property: "og:description",
        content:
          "Discover amazing public forms created by the community. Filter by category, price, and more.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `${useRuntimeConfig().public.publicUrl}/marketplace`,
      },
      {
        property: "og:image",
        content: `${useRuntimeConfig().public.publicUrl}/form.png`,
      },
      {
        property: "og:site_name",
        content: "SUTIT Forms",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Marketplace - Discover Public Forms | SUTIT Forms",
      },
      {
        name: "twitter:description",
        content: "Discover amazing public forms created by the community",
      },
      {
        name: "twitter:image",
        content: `${useRuntimeConfig().public.publicUrl}/form.png`,
      },
    ],
    link: [
      {
        rel: "canonical",
        href: `${useRuntimeConfig().public.publicUrl}/marketplace`,
      },
    ],
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Public Forms Marketplace",
          description:
            "Browse through our curated collection of public forms created by the community",
          url: `${useRuntimeConfig().public.publicUrl}/marketplace`,
          mainEntity: {
            "@type": "ItemList",
            name: "Public Forms",
            description: "Collection of public forms available for use",
            numberOfItems: totalForms.value,
          },
          publisher: {
            "@type": "Organization",
            name: "SUTIT Forms",
            url: useRuntimeConfig().public.publicUrl,
          },
        }),
      },
    ],
  });
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Hero Section -->
    <section class="border-border relative overflow-hidden border-b py-16">
      <div
        class="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent"
      ></div>
      <div class="relative container mx-auto px-4">
        <div class="mx-auto max-w-3xl text-center">
          <div
            class="bg-primary/10 text-primary hover:bg-primary/20 mb-4 inline-flex cursor-default items-center gap-2 rounded-full px-4 py-2 transition-colors"
          >
            <ShoppingBag class="h-4 w-4 animate-pulse" />
            <span class="text-sm font-medium">Public Forms Marketplace</span>
          </div>
          <h1 class="mb-4 text-4xl leading-tight font-bold md:text-6xl">
            <span
              class="from-foreground via-primary to-foreground animate-gradient bg-gradient-to-r bg-clip-text text-transparent"
            >
              Discover Amazing Forms
            </span>
          </h1>
          <p class="text-muted-foreground mb-6 text-lg md:text-xl">
            Browse through our curated collection of public forms created by the community
          </p>

          <!-- Quick Stats -->
          <div class="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div class="group flex cursor-default items-center gap-2">
              <div
                class="bg-primary h-2 w-2 animate-pulse rounded-full transition-transform group-hover:scale-125"
              ></div>
              <span class="text-muted-foreground font-medium">{{ totalForms }}+ Forms</span>
            </div>
            <div class="bg-border h-4 w-px"></div>
            <div class="group flex cursor-default items-center gap-2">
              <div
                class="bg-chart-3 h-2 w-2 animate-pulse rounded-full transition-transform group-hover:scale-125"
              ></div>
              <span class="text-muted-foreground font-medium"
                >{{ totalCategories }}+ Categories</span
              >
            </div>
            <div class="bg-border h-4 w-px"></div>
            <div class="group flex cursor-default items-center gap-2">
              <div
                class="bg-chart-4 h-2 w-2 animate-pulse rounded-full transition-transform group-hover:scale-125"
              ></div>
              <span class="text-muted-foreground font-medium">All Free to Use</span>
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
            class="border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          ></div>
          <p class="text-muted-foreground">Loading amazing forms...</p>
        </div>
      </div>

      <div v-else class="flex flex-col gap-6 lg:flex-row">
        <!-- Mobile Filters Trigger -->
        <div class="lg:hidden">
          <Button @click="filtersOpen = !filtersOpen" variant="outline" class="mb-4 w-full">
            <Filter class="mr-2 h-4 w-4" />
            {{ filtersOpen ? "Hide" : "Show" }} Filters
            <ChevronRight
              class="ml-auto h-4 w-4 transition-transform"
              :class="filtersOpen ? 'rotate-90' : ''"
            />
          </Button>
        </div>

        <!-- Sidebar Filters -->
        <Collapsible v-model:open="filtersOpen" class="lg:hidden">
          <CollapsibleContent class="overflow-hidden">
            <aside class="mb-6 flex-shrink-0">
              <div class="space-y-4">
                <!-- Search -->
                <Card class="border-border/50 transition-shadow hover:shadow-lg">
                  <CardHeader class="pb-3">
                    <CardTitle class="flex items-center gap-2 text-base font-semibold">
                      <Search class="text-primary h-4 w-4" />
                      Search Forms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="relative">
                      <Search
                        class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                      />
                      <Input
                        v-model="filters.search"
                        placeholder="Search by name or tag..."
                        class="pr-10 pl-10"
                        @input="debouncedSearch"
                      />
                      <Button
                        v-if="filters.search"
                        variant="ghost"
                        size="sm"
                        class="hover:bg-destructive/10 hover:text-destructive absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        @click="clearSearch"
                      >
                        <X class="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <!-- Categories -->
                <Card class="border-border/50 transition-shadow hover:shadow-lg">
                  <CardHeader class="pb-3">
                    <CardTitle class="flex items-center gap-2 text-base font-semibold">
                      <Layers class="text-primary h-4 w-4" />
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
                          class="group relative flex w-full items-center justify-between overflow-hidden rounded-lg p-3 transition-all duration-200"
                          :class="
                            selectedCategories.includes(category.id)
                              ? 'bg-primary text-primary-foreground scale-[1.02] shadow-md'
                              : 'bg-muted/30 hover:bg-muted text-foreground hover:scale-[1.01]'
                          "
                        >
                          <div
                            class="to-primary/10 absolute inset-0 bg-gradient-to-r from-transparent opacity-0 transition-opacity group-hover:opacity-100"
                          ></div>
                          <div class="relative z-10 flex items-center gap-3">
                            <div
                              class="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                              :class="
                                selectedCategories.includes(category.id)
                                  ? 'bg-primary-foreground/20'
                                  : 'bg-primary/10'
                              "
                            >
                              <Tag
                                class="h-4 w-4"
                                :class="
                                  selectedCategories.includes(category.id)
                                    ? 'text-primary-foreground'
                                    : 'text-primary'
                                "
                              />
                            </div>
                            <span class="text-sm font-medium">{{ category.name }}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            class="relative z-10 text-xs transition-colors"
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
                <Card class="border-border/50 transition-shadow hover:shadow-lg">
                  <CardHeader class="pb-3">
                    <CardTitle class="flex items-center gap-2 text-base font-semibold">
                      <DollarSign class="text-primary h-4 w-4" />
                      Price Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      <button
                        v-for="price in priceRanges"
                        :key="price.id"
                        @click="selectPriceRange(price.id)"
                        class="group relative flex w-full items-center justify-between overflow-hidden rounded-lg p-3 transition-all duration-200"
                        :class="
                          filters.priceRange === price.id
                            ? 'bg-primary text-primary-foreground scale-[1.02] shadow-md'
                            : 'bg-muted/30 hover:bg-muted text-foreground hover:scale-[1.01]'
                        "
                      >
                        <div
                          class="to-primary/10 absolute inset-0 bg-gradient-to-r from-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        ></div>
                        <span class="relative z-10 text-sm font-medium">{{ price.label }}</span>
                        <CheckCircle2
                          v-if="filters.priceRange === price.id"
                          class="animate-in zoom-in-50 relative z-10 h-4 w-4 duration-200"
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <!-- Sort Options -->
                <Card class="border-border/50 transition-shadow hover:shadow-lg">
                  <CardHeader class="pb-3">
                    <CardTitle class="flex items-center gap-2 text-base font-semibold">
                      <ArrowUpDown class="text-primary h-4 w-4" />
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
                            <TrendingUp class="h-4 w-4" />
                            Most Popular
                          </div>
                        </SelectItem>
                        <SelectItem value="newest">
                          <div class="flex items-center gap-2">
                            <Clock class="h-4 w-4" />
                            Newest First
                          </div>
                        </SelectItem>
                        <SelectItem value="price-low">
                          <div class="flex items-center gap-2">
                            <ArrowUp class="h-4 w-4" />
                            Price: Low to High
                          </div>
                        </SelectItem>
                        <SelectItem value="price-high">
                          <div class="flex items-center gap-2">
                            <ArrowDown class="h-4 w-4" />
                            Price: High to Low
                          </div>
                        </SelectItem>
                        <SelectItem value="title">
                          <div class="flex items-center gap-2">
                            <FileText class="h-4 w-4" />
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
                  class="group hover:bg-destructive/10 hover:text-destructive hover:border-destructive w-full transition-all"
                  @click="clearFilters"
                  v-if="hasActiveFilters"
                >
                  <X class="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  Clear All Filters
                </Button>
              </div>
            </aside>
          </CollapsibleContent>
        </Collapsible>

        <!-- Desktop Sidebar -->
        <aside class="hidden flex-shrink-0 lg:block lg:w-80">
          <div class="sticky top-4 space-y-4">
            <!-- Search -->
            <Card class="border-border/50 transition-shadow hover:shadow-lg">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-base font-semibold">
                  <Search class="text-primary h-4 w-4" />
                  Search Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="relative">
                  <Search
                    class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  />
                  <Input
                    v-model="filters.search"
                    placeholder="Search by name or tag..."
                    class="pr-10 pl-10"
                    @input="debouncedSearch"
                  />
                  <Button
                    v-if="filters.search"
                    variant="ghost"
                    size="sm"
                    class="hover:bg-destructive/10 hover:text-destructive absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                    @click="clearSearch"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Categories -->
            <Card class="border-border/50 transition-shadow hover:shadow-lg">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-base font-semibold">
                  <Layers class="text-primary h-4 w-4" />
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
                      class="group relative flex w-full items-center justify-between overflow-hidden rounded-lg p-3 transition-all duration-200"
                      :class="
                        selectedCategories.includes(category.id)
                          ? 'bg-primary text-primary-foreground scale-[1.02] shadow-md'
                          : 'bg-muted/30 hover:bg-muted text-foreground hover:scale-[1.01]'
                      "
                    >
                      <div
                        class="to-primary/10 absolute inset-0 bg-gradient-to-r from-transparent opacity-0 transition-opacity group-hover:opacity-100"
                      ></div>
                      <div class="relative z-10 flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                          :class="
                            selectedCategories.includes(category.id)
                              ? 'bg-primary-foreground/20'
                              : 'bg-primary/10'
                          "
                        >
                          <Tag
                            class="h-4 w-4"
                            :class="
                              selectedCategories.includes(category.id)
                                ? 'text-primary-foreground'
                                : 'text-primary'
                            "
                          />
                        </div>
                        <span class="text-sm font-medium">{{ category.name }}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        class="relative z-10 text-xs transition-colors"
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
            <Card class="border-border/50 transition-shadow hover:shadow-lg">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-base font-semibold">
                  <DollarSign class="text-primary h-4 w-4" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <button
                    v-for="price in priceRanges"
                    :key="price.id"
                    @click="selectPriceRange(price.id)"
                    class="group relative flex w-full items-center justify-between overflow-hidden rounded-lg p-3 transition-all duration-200"
                    :class="
                      filters.priceRange === price.id
                        ? 'bg-primary text-primary-foreground scale-[1.02] shadow-md'
                        : 'bg-muted/30 hover:bg-muted text-foreground hover:scale-[1.01]'
                    "
                  >
                    <div
                      class="to-primary/10 absolute inset-0 bg-gradient-to-r from-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    ></div>
                    <span class="relative z-10 text-sm font-medium">{{ price.label }}</span>
                    <CheckCircle2
                      v-if="filters.priceRange === price.id"
                      class="animate-in zoom-in-50 relative z-10 h-4 w-4 duration-200"
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Sort Options -->
            <Card class="border-border/50 transition-shadow hover:shadow-lg">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-base font-semibold">
                  <ArrowUpDown class="text-primary h-4 w-4" />
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
                        <TrendingUp class="h-4 w-4" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div class="flex items-center gap-2">
                        <Clock class="h-4 w-4" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">
                      <div class="flex items-center gap-2">
                        <ArrowUp class="h-4 w-4" />
                        Price: Low to High
                      </div>
                    </SelectItem>
                    <SelectItem value="price-high">
                      <div class="flex items-center gap-2">
                        <ArrowDown class="h-4 w-4" />
                        Price: High to Low
                      </div>
                    </SelectItem>
                    <SelectItem value="title">
                      <div class="flex items-center gap-2">
                        <FileText class="h-4 w-4" />
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
              class="group hover:bg-destructive/10 hover:text-destructive hover:border-destructive w-full transition-all"
              @click="clearFilters"
              v-if="hasActiveFilters"
            >
              <X class="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Clear All Filters
            </Button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="min-w-0 flex-1">
          <!-- Toolbar -->
          <div class="mb-6">
            <Card class="border-border/50 transition-shadow hover:shadow-lg">
              <CardContent class="p-4">
                <div
                  class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" class="px-3 py-1 text-sm font-medium">
                      {{ totalForms }}
                      {{ totalForms === 1 ? "form" : "forms" }} found
                    </Badge>
                    <TransitionGroup name="badge">
                      <Badge
                        v-for="cat in selectedCategories"
                        :key="cat"
                        variant="outline"
                        class="hover:bg-destructive/10 hover:border-destructive gap-1 py-1 pr-1 pl-2 text-xs transition-colors"
                      >
                        {{ categories.find((c) => c.id === cat)?.name }}
                        <button
                          @click="toggleCategory(cat)"
                          class="hover:text-destructive hover:bg-destructive/20 ml-1 rounded-sm p-0.5 transition-colors"
                        >
                          <X class="h-3 w-3" />
                        </button>
                      </Badge>
                    </TransitionGroup>
                  </div>

                  <div class="flex w-full items-center gap-2 sm:w-auto">
                    <div class="border-border flex overflow-hidden rounded-lg border shadow-sm">
                      <button
                        @click="viewMode = 'grid'"
                        class="p-2 transition-all duration-200"
                        :class="
                          viewMode === 'grid'
                            ? 'bg-primary text-primary-foreground shadow-inner'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        "
                      >
                        <LayoutGrid class="h-4 w-4" />
                      </button>
                      <div class="bg-border w-px"></div>
                      <button
                        @click="viewMode = 'list'"
                        class="p-2 transition-all duration-200"
                        :class="
                          viewMode === 'list'
                            ? 'bg-primary text-primary-foreground shadow-inner'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        "
                      >
                        <List class="h-4 w-4" />
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
            class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <Card
              v-for="form in data?.data"
              :key="form.id"
              class="group border-border/50 cursor-pointer overflow-hidden pt-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <!-- Image/Preview -->
              <div
                class="from-primary/10 via-primary/5 relative h-48 overflow-hidden bg-gradient-to-br to-transparent"
              >
                <div
                  class="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                >
                  <FileText class="text-primary/20 h-20 w-20" />
                </div>
                <div
                  class="from-background/80 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                ></div>

                <div class="absolute top-3 right-3 flex gap-2">
                  <Badge v-if="form.isFeatured" class="bg-yellow-500 shadow-lg hover:bg-yellow-500">
                    <Star class="mr-1 h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                  <Badge
                    v-if="parseFloat(form.price) === 0"
                    class="bg-chart-3 hover:bg-chart-3 shadow-lg"
                  >
                    <Sparkles class="mr-1 h-3 w-3" />
                    Free
                  </Badge>
                </div>

                <div class="absolute bottom-3 left-3">
                  <Badge
                    variant="secondary"
                    class="bg-background/80 text-xs shadow-md backdrop-blur-sm"
                  >
                    {{ form.tags[0] || "General" }}
                  </Badge>
                </div>
              </div>

              <CardHeader class="pb-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <CardTitle
                      class="group-hover:text-primary truncate text-lg font-bold transition-colors"
                    >
                      {{ form.title }}
                    </CardTitle>
                    <CardDescription class="mt-1 line-clamp-2 text-sm">
                      {{ form.description || "No description provided" }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent class="space-y-4 pt-0">
                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in form.tags.slice(0, 3)"
                    :key="tag"
                    variant="outline"
                    class="hover:bg-primary/10 hover:border-primary text-xs transition-colors"
                  >
                    {{ tag }}
                  </Badge>
                  <Badge v-if="form.tags.length > 3" variant="outline" class="text-xs">
                    +{{ form.tags.length - 3 }}
                  </Badge>
                </div>

                <!-- Creator -->
                <div class="border-border flex items-center gap-2 border-t pt-2">
                  <Avatar class="ring-border h-6 w-6 ring-2">
                    <AvatarImage :src="form.creator?.image || ''" />
                    <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                      {{ getInitials(form.creator?.name || "Anonymous") }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="text-muted-foreground truncate text-xs">
                    {{ form.creator?.name || "Anonymous" }}
                  </span>
                  <div class="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
                    <Clock class="h-3 w-3" />
                    <span>{{ formatDate(form.createdAt) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-2">
                  <NuxtLink
                    :to="`/forms/${form.slug}`"
                    :class="buttonVariants({ size: 'sm', class: 'group flex-1' })"
                  >
                    <Eye class="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    View Form
                  </NuxtLink>
                  <Button variant="outline" size="sm" class="flex-1 font-semibold">
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
          <TransitionGroup v-else name="list" tag="div" class="mb-8 space-y-4">
            <Card
              v-for="form in data?.data"
              :key="form.id"
              class="border-border/50 group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <CardContent class="p-6">
                <div class="flex flex-col gap-6 sm:flex-row">
                  <!-- Preview -->
                  <div
                    class="from-primary/10 via-primary/5 relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br to-transparent sm:w-48"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    >
                      <FileText class="text-primary/20 h-16 w-16" />
                    </div>
                    <div class="absolute top-2 right-2 flex gap-2">
                      <Badge
                        v-if="form.isFeatured"
                        class="bg-yellow-500 text-xs shadow-md hover:bg-yellow-500"
                      >
                        <Star class="mr-1 h-3 w-3 fill-current" />
                        Featured
                      </Badge>
                      <Badge
                        v-if="parseFloat(form.price) === 0"
                        class="bg-chart-3 hover:bg-chart-3 text-xs shadow-md"
                      >
                        Free
                      </Badge>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="min-w-0 flex-1 space-y-3">
                    <div>
                      <div class="mb-2 flex items-start justify-between gap-4">
                        <h3
                          class="hover:text-primary group-hover:text-primary text-xl font-bold transition-colors"
                        >
                          {{ form.title }}
                        </h3>
                        <Badge variant="secondary" class="shrink-0">{{
                          form.tags[0] || "General"
                        }}</Badge>
                      </div>
                      <p class="text-muted-foreground line-clamp-2 text-sm">
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

                    <div class="border-border flex items-center justify-between border-t pt-2">
                      <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-2">
                          <Avatar class="ring-border h-6 w-6 ring-2">
                            <AvatarImage :src="form.creator?.image || ''" />
                            <AvatarFallback class="bg-primary/10 text-primary text-xs">
                              {{ getInitials(form.creator?.name || "A") }}
                            </AvatarFallback>
                          </Avatar>
                          <span class="text-muted-foreground text-xs">{{
                            form.creator?.name || "Anonymous"
                          }}</span>
                        </div>
                        <div class="text-muted-foreground flex items-center gap-1">
                          <Clock class="h-3 w-3" />
                          <span class="text-xs">{{ formatDate(form.createdAt) }}</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <NuxtLink
                          :to="`/forms/${form.slug}`"
                          :class="buttonVariants({ size: 'sm' })"
                        >
                          <Eye class="mr-2 h-4 w-4" />
                          View
                        </NuxtLink>
                        <Button variant="outline" size="sm" class="font-semibold">
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
            class="border-2 border-dashed"
          >
            <CardContent class="flex flex-col items-center justify-center py-20">
              <div class="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <Search class="text-muted-foreground h-10 w-10" />
              </div>
              <h3 class="mb-2 text-2xl font-bold">No forms found</h3>
              <p class="text-muted-foreground mb-6 max-w-md text-center">
                We couldn't find any forms matching your criteria. Try adjusting your filters or
                search terms.
              </p>
              <Button @click="clearFilters" class="group">
                <X class="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
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
                <ChevronLeft class="h-4 w-4" />
              </Button>

              <div class="flex items-center gap-1">
                <Button
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === filters.currentPage ? 'default' : 'outline'"
                  size="sm"
                  @click="filters.currentPage = page"
                  class="w-10 transition-all"
                  :class="page === filters.currentPage ? 'scale-110' : 'hover:scale-105'"
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
                <ChevronRight class="h-4 w-4" />
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
