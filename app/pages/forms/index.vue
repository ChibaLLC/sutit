<script setup lang="ts">
  import {
    FileText,
    Plus,
    CheckCircle,
    DollarSign,
    TrendingUp,
    Globe,
    MoreVertical,
    Settings,
    Copy,
    Trash2,
    BarChart3,
    Users,
    Eye,
    Edit,
    Search,
    X,
    ArrowUpDown,
    Users2,
    Share,
    Filter,
    AlertTriangle,
    Loader,
    ChevronLeft,
    ChevronRight,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { buttonVariants } from "~/components/ui/button";
  import { authHeaders } from "~/lib/auth-client";

  definePageMeta({
    middleware: ["auth"],
  });

  const filters = ref({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    currentPage: 1,
    itemsPerPage: 24,
  });

  const filtersOpen = ref(false);

  const { data: forms, pending } = await useFetch("/api/forms", {
    method: "get",
    headers: {
      ...(await authHeaders()),
    },
    query: filters,
  });

  // Computed property for filtered forms (applying search and status filters)
  const filteredForms = computed(() => {
    if (!forms.value?.data) return [];

    let result = [...forms.value.data];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(
        (form) =>
          form.title.toLowerCase().includes(searchTerm) ||
          (form.description && form.description.toLowerCase().includes(searchTerm)) ||
          (form.tags && form.tags.some((tag) => tag.toLowerCase().includes(searchTerm))),
      );
    }

    // Apply status filter
    if (filters.value.status !== "all") {
      result = result.filter((form) => form.status === filters.value.status);
    }

    // Apply date filters
    if (filters.value.startDate) {
      const startDate = new Date(filters.value.startDate);
      result = result.filter((form) => new Date(form.createdAt) >= startDate);
    }

    if (filters.value.endDate) {
      const endDate = new Date(filters.value.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter((form) => new Date(form.createdAt) <= endDate);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[filters.value.sortBy as keyof FormSchema];
      let bValue: any = b[filters.value.sortBy as keyof FormSchema];

      // Handle date fields
      if (filters.value.sortBy === "createdAt" || filters.value.sortBy === "updatedAt") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle string fields
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (filters.value.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  });

  // Computed property for paginated forms
  const paginatedForms = computed(() => {
    const start = (filters.value.currentPage - 1) * filters.value.itemsPerPage;
    const end = start + filters.value.itemsPerPage;
    return filteredForms.value.slice(start, end);
  });

  // Total pages based on filtered results
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredForms.value.length / filters.value.itemsPerPage)),
  );

  // Total filtered count
  const totalFilteredCount = computed(() => filteredForms.value.length);

  // Visible page numbers for pagination
  const visiblePages = computed(() => {
    const current = filters.value.currentPage;
    const total = totalPages.value;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  });

  const selectedForm = ref<FormSchema | null>(null);
  const shareModalOpen = ref(false);

  // Computed properties for stats (based on filtered forms)
  const publishedCount = computed(
    () => filteredForms.value.filter((form) => form.status === "published").length,
  );

  const totalRevenue = computed(() =>
    filteredForms.value
      .reduce((sum, form) => sum + (parseFloat(form.price?.toString()) || 0), 0)
      .toFixed(2),
  );

  const avgSubmissions = computed(() => {
    return Math.floor(Math.random() * 50) + 10;
  });

  // Reset to page 1 when filters change
  watch(
    () => [
      filters.value.search,
      filters.value.status,
      filters.value.startDate,
      filters.value.endDate,
      filters.value.itemsPerPage,
    ],
    () => {
      filters.value.currentPage = 1;
    },
  );

  // Ensure current page doesn't exceed total pages
  watch(totalPages, (newTotalPages) => {
    if (filters.value.currentPage > newTotalPages && newTotalPages > 0) {
      filters.value.currentPage = newTotalPages;
    }
  });

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return (
      filters.value.search !== "" ||
      filters.value.status !== "all" ||
      filters.value.startDate !== "" ||
      filters.value.endDate !== ""
    );
  });

  // Filter and pagination methods
  const clearFilters = () => {
    filters.value.search = "";
    filters.value.status = "all";
    filters.value.startDate = "";
    filters.value.endDate = "";
  };

  const toggleSortOrder = () => {
    filters.value.sortOrder = filters.value.sortOrder === "asc" ? "desc" : "asc";
  };

  const toggleShareModal = (form?: FormSchema) => {
    if (form) {
      selectedForm.value = form;
    }
    shareModalOpen.value = !shareModalOpen.value;
  };

  const toggleFilters = () => {
    filtersOpen.value = !filtersOpen.value;
  };

  // Form deletion
  const deleteDialogOpen = ref(false);
  const formToDelete = ref<FormSchema | null>(null);
  const isDeleting = ref(false);

  const openDeleteDialog = (form: FormSchema) => {
    formToDelete.value = form;
    deleteDialogOpen.value = true;
  };

  const deleteForm = async () => {
    if (!formToDelete.value) return;

    isDeleting.value = true;
    try {
      await $fetch(`/api/forms/${formToDelete.value.id}`, {
        method: "DELETE",
        headers: {
          ...(await authHeaders()),
        },
      });

      toast.success("Form deleted successfully");
      // Refresh the forms list
      await refreshNuxtData();
    } catch (error: any) {
      console.error("Error deleting form:", error);
      toast.error(error.data?.message || "Failed to delete form");
    } finally {
      isDeleting.value = false;
      deleteDialogOpen.value = false;
      formToDelete.value = null;
    }
  };
</script>

<template>
  <div class="container mx-auto">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-accent flex h-8 w-8 items-center justify-center rounded-lg">
            <FileText class="text-accent-foreground h-4 w-4" />
          </div>
          <h1 class="text-foreground text-2xl font-bold">All Forms</h1>
        </div>
        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            @click="toggleFilters"
            :class="{ 'bg-accent': filtersOpen || hasActiveFilters }"
          >
            <Filter class="mr-2 h-4 w-4" />
            Filters
            <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2">
              {{ hasActiveFilters ? "Active" : "" }}
            </Badge>
          </Button>
          <NuxtLink to="/forms/new" :class="buttonVariants()">
            <Plus class="mr-2 h-4 w-4" />
            New Form
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <!-- Loading skeletons -->
      <template v-if="pending">
        <Card v-for="i in 4" :key="i" class="border-border/50">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 space-y-2">
                <div class="bg-muted/50 h-4 w-24 animate-pulse rounded" />
                <div class="bg-muted/50 h-8 w-16 animate-pulse rounded" />
              </div>
              <div class="bg-muted/50 h-12 w-12 animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </template>

      <!-- Actual stats -->
      <template v-else>
        <Card class="border-border/50 transition-all duration-300 hover:shadow-lg">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted-foreground text-sm font-medium">Total Forms</p>
                <p class="text-foreground text-3xl font-bold">
                  {{ totalFilteredCount }}
                </p>
              </div>
              <div class="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText class="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-border/50 transition-all duration-300 hover:shadow-lg">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted-foreground text-sm font-medium">Published</p>
                <p class="text-foreground text-3xl font-bold">
                  {{ publishedCount }}
                </p>
              </div>
              <div class="bg-chart-3/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <CheckCircle class="text-chart-3 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-border/50 transition-all duration-300 hover:shadow-lg">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted-foreground text-sm font-medium">Total Revenue</p>
                <p class="text-foreground text-3xl font-bold">Ksh {{ totalRevenue }}</p>
              </div>
              <div class="bg-chart-4/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <DollarSign class="text-chart-4 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-border/50 transition-all duration-300 hover:shadow-lg">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted-foreground text-sm font-medium">Avg. Submissions</p>
                <p class="text-foreground text-3xl font-bold">
                  {{ avgSubmissions }}
                </p>
              </div>
              <div class="bg-chart-2/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <TrendingUp class="text-chart-2 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Collapsible Filters Section -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="filtersOpen" class="mb-8">
        <Card class="border-border/50">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-lg font-semibold">Filter Forms</CardTitle>
                <CardDescription>Search and filter your forms by various criteria</CardDescription>
              </div>
              <Button variant="ghost" size="sm" @click="toggleFilters" class="h-8 w-8 p-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <!-- Search Input -->
              <div class="space-y-2">
                <label class="text-foreground text-sm font-medium">Search</label>
                <div class="relative">
                  <Search
                    class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
                  />
                  <Input v-model="filters.search" placeholder="Search forms..." class="pl-10" />
                </div>
              </div>

              <!-- Status Filter -->
              <div class="space-y-2">
                <label class="text-foreground text-sm font-medium">Status</label>
                <Select v-model="filters.status">
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Start Date -->
              <div class="space-y-2">
                <label class="text-foreground text-sm font-medium">Start Date</label>
                <Input v-model="filters.startDate" type="date" class="w-full" />
              </div>

              <!-- End Date -->
              <div class="space-y-2">
                <label class="text-foreground text-sm font-medium">End Date</label>
                <Input v-model="filters.endDate" type="date" class="w-full" />
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="border-border mt-4 flex items-center justify-between border-t pt-4">
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="clearFilters"
                  :disabled="!hasActiveFilters"
                >
                  <X class="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
                <Badge variant="secondary" class="text-xs"> {{ totalFilteredCount }} forms </Badge>
              </div>
              <div class="flex items-center gap-2">
                <Select v-model="filters.sortBy">
                  <SelectTrigger class="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" @click="toggleSortOrder">
                  <ArrowUpDown class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Transition>

    <!-- Forms Grid with Loading State -->
    <div
      v-if="pending"
      class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <Card v-for="i in 8" :key="i" class="border-border/50">
        <CardHeader class="pb-3">
          <div class="space-y-3">
            <div class="flex gap-2">
              <div class="bg-muted/50 h-5 w-20 animate-pulse rounded" />
              <div class="bg-muted/50 h-5 w-16 animate-pulse rounded" />
            </div>
            <div class="bg-muted/50 h-6 w-full animate-pulse rounded" />
            <div class="bg-muted/50 h-4 w-3/4 animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent class="space-y-4 pt-0">
          <div class="bg-muted/50 h-16 w-full animate-pulse rounded-lg" />
          <div class="space-y-2">
            <div class="bg-muted/50 h-4 w-full animate-pulse rounded" />
            <div class="bg-muted/50 h-4 w-full animate-pulse rounded" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-muted/50 h-9 animate-pulse rounded" />
            <div class="bg-muted/50 h-9 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Forms Grid -->
    <div v-else class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card
        v-for="form in paginatedForms"
        :key="form.id"
        class="group border-border/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      >
        <CardHeader class="pb-3">
          <div class="mb-3 flex items-start justify-between">
            <div class="flex items-center gap-2">
              <Badge
                :variant="form.status === 'published' ? 'default' : 'secondary'"
                class="text-xs font-medium"
                :class="{
                  'bg-chart-3 hover:bg-chart-3/90': form.status === 'published',
                  'bg-chart-4 hover:bg-chart-4/90': form.status === 'draft',
                  'bg-muted hover:bg-muted/90': form.status === 'archived',
                }"
              >
                {{ form.status.charAt(0).toUpperCase() + form.status.slice(1) }}
              </Badge>
              <Badge v-if="form.isPublic" variant="outline" class="text-xs">
                <Globe class="mr-1 h-3 w-3" />
                Public
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings class="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy class="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="openDeleteDialog(form)">
                  <Trash2 class="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle class="text-lg leading-tight font-bold text-balance transition-colors">
            {{ form.title }}
          </CardTitle>
          <CardDescription class="text-muted-foreground mt-1 line-clamp-2 text-sm text-pretty">
            {{ form.description || "No description provided" }}
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-4 pt-0">
          <!-- Creator Info -->
          <div class="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
            <Avatar class="h-8 w-8">
              <AvatarImage :src="form.creator.image || ''" />
              <AvatarFallback class="bg-accent text-accent-foreground text-xs font-medium">
                {{ getInitials(form.creator.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="text-foreground truncate text-sm font-medium">
                {{ form.creator.name }}
              </p>
              <p class="text-muted-foreground text-xs">
                {{ formatDate(form.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Form Details -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Price</span>
              <span class="text-foreground font-semibold"
                >Ksh {{ parseFloat(form.price).toFixed(2) }}</span
              >
            </div>

            <div class="flex items-center justify-between text-sm" v-if="form.allowGroups">
              <span class="text-muted-foreground">Group Limit</span>
              <span class="text-foreground font-medium">{{ form.groupMemberLimit }} members</span>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1" v-if="form.tags && form.tags.length > 0">
            <Badge
              v-for="tag in form.tags.slice(0, 2)"
              :key="tag"
              variant="outline"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
            <Badge v-if="form.tags.length > 2" variant="outline" class="text-xs">
              +{{ form.tags.length - 2 }}
            </Badge>
          </div>

          <!-- Primary Actions - More visible -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                :to="`/forms/${form.slug}`"
                :class="buttonVariants({ size: 'sm', class: 'w-full' })"
              >
                <Eye class="mr-2 h-4 w-4" />
                View
              </NuxtLink>
              <Button variant="secondary" size="sm" class="w-full" @click="toggleShareModal(form)">
                <Share class="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                :to="`/forms/${form.id}/edit`"
                :class="
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    class: 'w-full',
                  })
                "
              >
                <Edit class="mr-2 h-4 w-4" />
                Edit
              </NuxtLink>
              <NuxtLink
                :to="`/forms/${form.id}/submissions`"
                :class="
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    class: 'w-full',
                  })
                "
              >
                <Users class="mr-2 h-4 w-4" />
                Submissions
              </NuxtLink>
            </div>

            <!-- Additional Actions -->
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" class="flex-1">
                <BarChart3 class="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <NuxtLink
                v-if="form.allowGroups"
                :to="`/forms/${form.id}/group`"
                :class="
                  buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                    class: 'flex-1',
                  })
                "
              >
                <Users2 class="mr-2 h-4 w-4" />
                Groups
              </NuxtLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <div v-if="totalFilteredCount === 0" class="col-span-full">
        <Card class="border-border/50 border-2 border-dashed">
          <CardContent class="flex flex-col items-center justify-center py-12">
            <FileText class="text-muted-foreground mb-4 h-12 w-12" />
            <h3 class="text-foreground mb-2 text-lg font-semibold">No forms found</h3>
            <p class="text-muted-foreground mb-4 text-center">
              Try adjusting your filters or create a new form to get started.
            </p>
            <NuxtLink :to="'/forms/new'" :class="buttonVariants()">
              <Plus class="mr-2 h-4 w-4" />
              Create New Form
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!pending && totalFilteredCount > 0"
      class="border-border mb-8 flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row"
    >
      <!-- Results info -->
      <div class="flex items-center gap-4">
        <p class="text-muted-foreground text-sm">
          Showing
          {{ Math.min((filters.currentPage - 1) * filters.itemsPerPage + 1, totalFilteredCount) }}
          to
          {{ Math.min(filters.currentPage * filters.itemsPerPage, totalFilteredCount) }}
          of {{ totalFilteredCount }} results
        </p>
        <Select v-model="filters.itemsPerPage">
          <SelectTrigger class="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="12">12</SelectItem>
            <SelectItem :value="24">24</SelectItem>
            <SelectItem :value="48">48</SelectItem>
            <SelectItem :value="96">96</SelectItem>
          </SelectContent>
        </Select>
        <span class="text-muted-foreground text-sm">per page</span>
      </div>

      <!-- Page controls -->
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="filters.currentPage === 1"
          @click="filters.currentPage--"
        >
          <ChevronLeft class="h-4 w-4" />
          <span class="ml-1 hidden sm:inline">Previous</span>
        </Button>

        <div class="flex items-center gap-1">
          <!-- First page + ellipsis if needed -->
          <template v-if="totalPages > 5 && filters.currentPage > 3">
            <Button
              variant="outline"
              size="sm"
              class="h-8 w-8 p-0"
              @click="filters.currentPage = 1"
            >
              1
            </Button>
            <span v-if="filters.currentPage > 4" class="text-muted-foreground px-1"> ... </span>
          </template>

          <!-- Page numbers -->
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="filters.currentPage === page ? 'default' : 'outline'"
            size="sm"
            class="h-8 w-8 p-0"
            @click="filters.currentPage = page"
          >
            {{ page }}
          </Button>

          <!-- Last page + ellipsis if needed -->
          <template v-if="totalPages > 5 && filters.currentPage < totalPages - 2">
            <span v-if="filters.currentPage < totalPages - 3" class="text-muted-foreground px-1">
              ...
            </span>
            <Button
              variant="outline"
              size="sm"
              class="h-8 w-8 p-0"
              @click="filters.currentPage = totalPages"
            >
              {{ totalPages }}
            </Button>
          </template>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="filters.currentPage === totalPages"
          @click="filters.currentPage++"
        >
          <span class="mr-1 hidden sm:inline">Next</span>
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="text-destructive h-5 w-5" />
            Delete Form
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ formToDelete?.title }}"?<br />
            <span class="text-destructive font-medium"> This action cannot be undone. </span>
            All submissions, responses, and associated data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="deleteForm"
            :disabled="isDeleting"
            class="bg-destructive hover:bg-destructive/90"
          >
            <Loader v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            <Trash2 v-else class="mr-2 h-4 w-4" />
            {{ isDeleting ? "Deleting..." : "Delete Form" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Share Modal -->
    <LazyFormsShareCard
      v-if="selectedForm"
      :form="selectedForm"
      :isOpen="shareModalOpen"
      @close="toggleShareModal()"
    />
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
