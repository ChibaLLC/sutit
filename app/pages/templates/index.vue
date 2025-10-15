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
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
          >
            <ShoppingBag class="w-4 h-4" />
            <span class="text-sm font-medium">Form Templates Marketplace</span>
          </div>
          <h1
            class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Discover Premium Form Templates
          </h1>
          <p class="text-lg text-muted-foreground mb-6">
            Browse through our curated collection of professional form
            templates. Find the perfect solution for your needs.
          </p>

          <!-- Quick Stats -->
          <div class="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span class="text-muted-foreground"
                >{{ totalForms }}+ Templates</span
              >
            </div>
            <div class="w-px h-4 bg-border"></div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-chart-3 animate-pulse"></div>
              <span class="text-muted-foreground"
                >{{ categories.length }} Categories</span
              >
            </div>
            <div class="w-px h-4 bg-border"></div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-chart-4 animate-pulse"></div>
              <span class="text-muted-foreground">Starting at Free</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Filters -->
        <aside class="lg:w-80 flex-shrink-0">
          <div class="sticky top-4 space-y-4">
            <!-- Search -->
            <Card class="border-border/50">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <Search class="w-4 h-4" />
                  Search Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  />
                  <Input
                    v-model="filters.search"
                    placeholder="Search by name or tag..."
                    class="pl-10"
                  />
                  <Button
                    v-if="filters.search"
                    variant="ghost"
                    size="sm"
                    class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    @click="filters.search = ''"
                  >
                    <X class="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Categories -->
            <Card class="border-border/50">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <Layers class="w-4 h-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    @click="toggleCategory(category.id)"
                    class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group"
                    :class="
                      selectedCategories.includes(category.id)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/30 hover:bg-muted text-foreground'
                    "
                  >
                    <div class="flex items-center gap-3">
                      <component
                        :is="category.icon"
                        class="w-4 h-4"
                        :class="
                          selectedCategories.includes(category.id)
                            ? 'text-primary-foreground'
                            : 'text-primary'
                        "
                      />
                      <span class="text-sm font-medium">{{
                        category.name
                      }}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      class="text-xs"
                      :class="
                        selectedCategories.includes(category.id)
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : ''
                      "
                    >
                      {{ category.count }}
                    </Badge>
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Price Range -->
            <Card class="border-border/50">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <DollarSign class="w-4 h-4" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <button
                    v-for="price in priceRanges"
                    :key="price.id"
                    @click="filters.priceRange = price.id"
                    class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
                    :class="
                      filters.priceRange === price.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/30 hover:bg-muted text-foreground'
                    "
                  >
                    <span class="text-sm font-medium">{{ price.label }}</span>
                    <CheckCircle2
                      v-if="filters.priceRange === price.id"
                      class="w-4 h-4"
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Rating Filter -->
            <Card class="border-border/50">
              <CardHeader class="pb-3">
                <CardTitle
                  class="text-base font-semibold flex items-center gap-2"
                >
                  <Star class="w-4 h-4" />
                  Minimum Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <button
                    v-for="rating in [5, 4, 3, 2, 1]"
                    :key="rating"
                    @click="filters.minRating = rating"
                    class="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
                    :class="
                      filters.minRating === rating
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/30 hover:bg-muted text-foreground'
                    "
                  >
                    <div class="flex items-center gap-2">
                      <Star
                        v-for="i in rating"
                        :key="i"
                        class="w-4 h-4 fill-current"
                        :class="
                          filters.minRating === rating
                            ? 'text-primary-foreground'
                            : 'text-primary'
                        "
                      />
                      <span class="text-sm font-medium">& Up</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Clear Filters -->
            <Button
              variant="outline"
              class="w-full"
              @click="clearFilters"
              v-if="hasActiveFilters"
            >
              <X class="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <!-- Toolbar -->
          <div class="mb-6">
            <Card class="border-border/50">
              <CardContent class="p-4">
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" class="text-sm font-medium">
                      {{ filteredForms.length }} templates found
                    </Badge>
                    <Badge
                      v-for="cat in selectedCategories"
                      :key="cat"
                      variant="outline"
                      class="text-xs"
                    >
                      {{ categories.find((c) => c.id === cat)?.name }}
                      <button
                        @click="toggleCategory(cat)"
                        class="ml-2 hover:text-destructive"
                      >
                        <X class="w-3 h-3" />
                      </button>
                    </Badge>
                  </div>

                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <Select v-model="filters.sortBy">
                      <SelectTrigger class="w-full sm:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low"
                          >Price: Low to High</SelectItem
                        >
                        <SelectItem value="price-high"
                          >Price: High to Low</SelectItem
                        >
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>

                    <div
                      class="flex border border-border rounded-lg overflow-hidden"
                    >
                      <button
                        @click="viewMode = 'grid'"
                        class="p-2 transition-colors"
                        :class="
                          viewMode === 'grid'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        "
                      >
                        <LayoutGrid class="w-4 h-4" />
                      </button>
                      <button
                        @click="viewMode = 'list'"
                        class="p-2 transition-colors"
                        :class="
                          viewMode === 'list'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
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

          <!-- Forms Grid/List -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <Card
              v-for="form in paginatedForms"
              :key="form.id"
              class="group border-border/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <!-- Image/Preview -->
              <div
                class="relative h-48 bg-gradient-to-br overflow-hidden"
                :style="{
                  backgroundImage: `linear-gradient(135deg, ${form.color}15 0%, ${form.color}05 100%)`,
                }"
              >
                <div class="absolute inset-0 flex items-center justify-center">
                  <component
                    :is="form.icon"
                    class="w-16 h-16 opacity-20"
                    :style="{ color: form.color }"
                  />
                </div>
                <div class="absolute top-3 right-3 flex gap-2">
                  <Badge
                    v-if="form.price === 0"
                    class="bg-chart-3 hover:bg-chart-3"
                  >
                    Free
                  </Badge>
                  <Badge v-if="form.featured" class="bg-primary">
                    <Sparkles class="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                <div class="absolute bottom-3 left-3">
                  <Badge variant="secondary" class="text-xs">
                    {{ form.category }}
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
                      {{ form.description }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent class="pt-0 space-y-4">
                <!-- Rating & Downloads -->
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 fill-primary text-primary" />
                    <span class="font-semibold">{{ form.rating }}</span>
                    <span class="text-muted-foreground"
                      >({{ form.reviews }})</span
                    >
                  </div>
                  <div class="flex items-center gap-1 text-muted-foreground">
                    <Download class="w-4 h-4" />
                    <span>{{ formatNumber(form.downloads) }}</span>
                  </div>
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in form.tags.slice(0, 3)"
                    :key="tag"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                </div>

                <!-- Creator -->
                <div
                  class="flex items-center gap-2 pt-2 border-t border-border"
                >
                  <Avatar class="w-6 h-6">
                    <AvatarImage :src="form.creator.image" />
                    <AvatarFallback class="text-xs">{{
                      form.creator.name.slice(0, 2)
                    }}</AvatarFallback>
                  </Avatar>
                  <span class="text-xs text-muted-foreground truncate">{{
                    form.creator.name
                  }}</span>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-2">
                  <Button class="flex-1" size="sm">
                    <Eye class="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" class="flex-1">
                    <span class="font-semibold">
                      {{ form.price === 0 ? "Free" : `Ksh ${form.price}` }}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <Card
              v-for="form in paginatedForms"
              :key="form.id"
              class="border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <CardContent class="p-6">
                <div class="flex flex-col sm:flex-row gap-6">
                  <!-- Preview -->
                  <div
                    class="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br"
                    :style="{
                      backgroundImage: `linear-gradient(135deg, ${form.color}15 0%, ${form.color}05 100%)`,
                    }"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <component
                        :is="form.icon"
                        class="w-12 h-12 opacity-20"
                        :style="{ color: form.color }"
                      />
                    </div>
                    <div class="absolute top-2 right-2">
                      <Badge
                        v-if="form.price === 0"
                        class="bg-chart-3 hover:bg-chart-3 text-xs"
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
                          class="text-xl font-bold hover:text-primary transition-colors"
                        >
                          {{ form.title }}
                        </h3>
                        <Badge variant="secondary">{{ form.category }}</Badge>
                      </div>
                      <p class="text-sm text-muted-foreground line-clamp-2">
                        {{ form.description }}
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-1">
                      <Badge
                        v-for="tag in form.tags"
                        :key="tag"
                        variant="outline"
                        class="text-xs"
                      >
                        {{ tag }}
                      </Badge>
                    </div>

                    <div class="flex items-center justify-between pt-2">
                      <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-1">
                          <Star class="w-4 h-4 fill-primary text-primary" />
                          <span class="font-semibold">{{ form.rating }}</span>
                          <span class="text-muted-foreground"
                            >({{ form.reviews }})</span
                          >
                        </div>
                        <div
                          class="flex items-center gap-1 text-muted-foreground"
                        >
                          <Download class="w-4 h-4" />
                          <span>{{ formatNumber(form.downloads) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <Avatar class="w-5 h-5">
                            <AvatarImage :src="form.creator.image" />
                            <AvatarFallback class="text-xs">{{
                              form.creator.name.slice(0, 2)
                            }}</AvatarFallback>
                          </Avatar>
                          <span class="text-xs text-muted-foreground">{{
                            form.creator.name
                          }}</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <Button size="sm">
                          <Eye class="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          {{ form.price === 0 ? "Free" : `Ksh ${form.price}` }}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Empty State -->
          <Card
            v-if="filteredForms.length === 0"
            class="border-dashed border-2"
          >
            <CardContent
              class="flex flex-col items-center justify-center py-16"
            >
              <Search class="w-16 h-16 text-muted-foreground mb-4" />
              <h3 class="text-xl font-semibold mb-2">No templates found</h3>
              <p class="text-muted-foreground text-center mb-6 max-w-md">
                We couldn't find any templates matching your criteria. Try
                adjusting your filters or search terms.
              </p>
              <Button @click="clearFilters">
                <X class="w-4 h-4 mr-2" />
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
                @click="currentPage--"
                :disabled="currentPage === 1"
              >
                <ChevronLeft class="w-4 h-4" />
              </Button>

              <div class="flex items-center gap-1">
                <Button
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'default' : 'outline'"
                  size="sm"
                  @click="currentPage = page"
                  class="w-10"
                >
                  {{ page }}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
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

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Search,
  X,
  Layers,
  DollarSign,
  Star,
  CheckCircle2,
  LayoutGrid,
  List,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Mail,
  ClipboardList,
  FileCheck,
  Calendar,
  MessageSquare,
  ShoppingCart,
  Users,
  Target,
  Receipt,
  Building,
} from "lucide-vue-next";

// 🔹 View Mode
const viewMode = ref<"grid" | "list">("grid");

// 🔹 Filters
const filters = ref({
  search: "",
  priceRange: "all",
  minRating: 0,
  sortBy: "popular",
});

// 🔹 Categories
interface Category {
  id: string;
  name: string;
  count: number;
  icon: any;
}

const categories: Category[] = [
  { id: "contact", name: "Contact Forms", count: 45, icon: Mail },
  { id: "survey", name: "Surveys & Polls", count: 38, icon: ClipboardList },
  { id: "registration", name: "Registration", count: 52, icon: FileCheck },
  { id: "booking", name: "Booking & Scheduling", count: 29, icon: Calendar },
  { id: "feedback", name: "Feedback", count: 34, icon: MessageSquare },
  { id: "ecommerce", name: "E-commerce", count: 41, icon: ShoppingCart },
  { id: "hr", name: "HR & Recruitment", count: 27, icon: Users },
  { id: "lead", name: "Lead Generation", count: 36, icon: Target },
  { id: "invoice", name: "Invoicing", count: 19, icon: Receipt },
  { id: "business", name: "Business Forms", count: 31, icon: Building },
];

// 🔹 Price Ranges
const priceRanges = [
  { id: "all", label: "All Prices" },
  { id: "free", label: "Free" },
  { id: "under-500", label: "Under Ksh 500" },
  { id: "under-1000", label: "Under Ksh 1,000" },
  { id: "premium", label: "Premium (Ksh 1,000+)" },
];

// 🔹 Mock Data
interface Form {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  downloads: number;
  tags: string[];
  featured: boolean;
  icon: any;
  color: string;
  creator: {
    name: string;
    image: string;
  };
}

const allForms = ref<Form[]>([
  {
    id: "1",
    title: "Professional Contact Form",
    description:
      "A sleek and modern contact form with validation, spam protection, and email notifications.",
    category: "Contact Forms",
    price: 0,
    rating: 4.8,
    reviews: 234,
    downloads: 12450,
    tags: ["Contact", "Business", "Free"],
    featured: true,
    icon: Mail,
    color: "#22c55e",
    creator: { name: "John Doe", image: "" },
  },
  {
    id: "2",
    title: "Customer Satisfaction Survey",
    description:
      "Comprehensive survey template with multiple question types and analytics dashboard.",
    category: "Surveys & Polls",
    price: 750,
    rating: 4.9,
    reviews: 187,
    downloads: 8920,
    tags: ["Survey", "Analytics", "Premium"],
    featured: true,
    icon: ClipboardList,
    color: "#3b82f6",
    creator: { name: "Sarah Smith", image: "" },
  },
  {
    id: "3",
    title: "Event Registration Form",
    description:
      "Perfect for conferences, workshops, and webinars. Includes payment integration.",
    category: "Registration",
    price: 500,
    rating: 4.7,
    reviews: 156,
    downloads: 7340,
    tags: ["Events", "Registration", "Payment"],
    featured: false,
    icon: FileCheck,
    color: "#a855f7",
    creator: { name: "Mike Johnson", image: "" },
  },
  {
    id: "4",
    title: "Appointment Booking System",
    description:
      "Complete booking solution with calendar sync, reminders, and availability management.",
    category: "Booking & Scheduling",
    price: 1200,
    rating: 4.9,
    reviews: 203,
    downloads: 9870,
    tags: ["Booking", "Calendar", "Premium"],
    featured: true,
    icon: Calendar,
    color: "#f59e0b",
    creator: { name: "Emily Brown", image: "" },
  },
  {
    id: "5",
    title: "Product Feedback Form",
    description:
      "Gather valuable customer insights with structured feedback collection and analysis.",
    category: "Feedback",
    price: 0,
    rating: 4.6,
    reviews: 142,
    downloads: 6250,
    tags: ["Feedback", "Product", "Free"],
    featured: false,
    icon: MessageSquare,
    color: "#ec4899",
    creator: { name: "David Lee", image: "" },
  },
]);

// 🔹 State for Categories
const selectedCategories = ref<string[]>([]);

// 🔹 Pagination
const currentPage = ref(1);
const itemsPerPage = 9;

// 🔹 Helpers
function toggleCategory(id: string) {
  const index = selectedCategories.value.indexOf(id);
  if (index > -1) selectedCategories.value.splice(index, 1);
  else selectedCategories.value.push(id);
}

function clearFilters() {
  filters.value = {
    search: "",
    priceRange: "all",
    minRating: 0,
    sortBy: "popular",
  };
  selectedCategories.value = [];
}

const hasActiveFilters = computed(() => {
  return (
    filters.value.search ||
    filters.value.priceRange !== "all" ||
    filters.value.minRating > 0 ||
    selectedCategories.value.length > 0
  );
});

function formatNumber(num: number) {
  return num.toLocaleString();
}

// 🔹 Filtered & Sorted Forms
const filteredForms = computed(() => {
  return allForms.value
    .filter((form) => {
      // Search
      if (
        filters.value.search &&
        !form.title
          .toLowerCase()
          .includes(filters.value.search.toLowerCase()) &&
        !form.tags.some((t) =>
          t.toLowerCase().includes(filters.value.search.toLowerCase()),
        )
      )
        return false;

      // Category
      if (
        selectedCategories.value.length &&
        !selectedCategories.value.some((catId) =>
          form.category.toLowerCase().includes(catId),
        )
      )
        return false;

      // Price
      if (filters.value.priceRange === "free" && form.price > 0) return false;
      if (filters.value.priceRange === "under-500" && form.price >= 500)
        return false;
      if (filters.value.priceRange === "under-1000" && form.price >= 1000)
        return false;
      if (filters.value.priceRange === "premium" && form.price < 1000)
        return false;

      // Rating
      if (filters.value.minRating && form.rating < filters.value.minRating)
        return false;

      return true;
    })
    .sort((a, b) => {
      switch (filters.value.sortBy) {
        case "newest":
          return b.reviews - a.reviews;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return b.downloads - a.downloads; // popular
      }
    });
});

// 🔹 Pagination logic
const totalPages = computed(() =>
  Math.ceil(filteredForms.value.length / itemsPerPage),
);

const paginatedForms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredForms.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  return pages;
});

// 🔹 Total stats
const totalForms = computed(() => allForms.value.length);

// Scroll to top on page change
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>
