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
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { buttonVariants } from "~/components/ui/button";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

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

const totalPages = computed(() =>
  Math.ceil(forms.value?.data.length / filters.value.itemsPerPage),
);

const selectedForm = ref<FormSchema | null>(null);
const shareModalOpen = ref(false);

// Computed properties for stats
const publishedCount = computed(
  () => forms.value?.data.filter((form) => form.status === "published").length,
);

const totalRevenue = computed(() =>
  forms.value?.data
    .reduce((sum, form) => sum + parseFloat(form.price?.toString()), 0)
    .toFixed(2),
);

const avgSubmissions = computed(() => {
  return Math.floor(Math.random() * 50) + 10;
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
          <div
            class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center"
          >
            <FileText class="w-4 h-4 text-accent-foreground" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">All Forms</h1>
        </div>
        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            @click="toggleFilters"
            :class="{ 'bg-accent': filtersOpen || hasActiveFilters }"
          >
            <Filter class="w-4 h-4 mr-2" />
            Filters
            <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2">
              {{ hasActiveFilters ? "Active" : "" }}
            </Badge>
          </Button>
          <NuxtLink to="/forms/new" :class="buttonVariants()">
            <Plus class="w-4 h-4 mr-2" />
            New Form
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <!-- Loading skeletons -->
      <template v-if="pending">
        <Card v-for="i in 4" :key="i" class="border-border/50">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="space-y-2 flex-1">
                <div class="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                <div class="h-8 w-16 bg-muted/50 rounded animate-pulse" />
              </div>
              <div class="w-12 h-12 bg-muted/50 rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </template>

      <!-- Actual stats -->
      <template v-else>
        <Card
          class="border-border/50 hover:shadow-lg transition-all duration-300"
        >
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Total Forms
                </p>
                <p class="text-3xl font-bold text-foreground">
                  {{ forms?.data.length }}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center"
              >
                <FileText class="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="border-border/50 hover:shadow-lg transition-all duration-300"
        >
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p class="text-3xl font-bold text-foreground">
                  {{ publishedCount }}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center"
              >
                <CheckCircle class="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="border-border/50 hover:shadow-lg transition-all duration-300"
        >
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p class="text-3xl font-bold text-foreground">
                  Ksh {{ totalRevenue }}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center"
              >
                <DollarSign class="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="border-border/50 hover:shadow-lg transition-all duration-300"
        >
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Avg. Submissions
                </p>
                <p class="text-3xl font-bold text-foreground">
                  {{ avgSubmissions }}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center"
              >
                <TrendingUp class="w-6 h-6 text-chart-2" />
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
                <CardTitle class="text-lg font-semibold"
                  >Filter Forms</CardTitle
                >
                <CardDescription
                  >Search and filter your forms by various
                  criteria</CardDescription
                >
              </div>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleFilters"
                class="h-8 w-8 p-0"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Search Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground"
                  >Search</label
                >
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  />
                  <Input
                    v-model="filters.search"
                    placeholder="Search forms..."
                    class="pl-10"
                  />
                </div>
              </div>

              <!-- Status Filter -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground"
                  >Status</label
                >
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
                <label class="text-sm font-medium text-foreground"
                  >Start Date</label
                >
                <Input v-model="filters.startDate" type="date" class="w-full" />
              </div>

              <!-- End Date -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground"
                  >End Date</label
                >
                <Input v-model="filters.endDate" type="date" class="w-full" />
              </div>
            </div>

            <!-- Filter Actions -->
            <div
              class="flex items-center justify-between mt-4 pt-4 border-t border-border"
            >
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="clearFilters"
                  :disabled="!hasActiveFilters"
                >
                  <X class="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
                <Badge variant="secondary" class="text-xs">
                  {{ forms?.data.length || 0 }} forms
                </Badge>
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
                  <ArrowUpDown class="w-4 h-4" />
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
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
    >
      <Card v-for="i in 8" :key="i" class="border-border/50">
        <CardHeader class="pb-3">
          <div class="space-y-3">
            <div class="flex gap-2">
              <div class="h-5 w-20 bg-muted/50 rounded animate-pulse" />
              <div class="h-5 w-16 bg-muted/50 rounded animate-pulse" />
            </div>
            <div class="h-6 w-full bg-muted/50 rounded animate-pulse" />
            <div class="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent class="pt-0 space-y-4">
          <div class="h-16 w-full bg-muted/50 rounded-lg animate-pulse" />
          <div class="space-y-2">
            <div class="h-4 w-full bg-muted/50 rounded animate-pulse" />
            <div class="h-4 w-full bg-muted/50 rounded animate-pulse" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="h-9 bg-muted/50 rounded animate-pulse" />
            <div class="h-9 bg-muted/50 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Forms Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
    >
      <Card
        v-for="form in forms?.data"
        :key="form.id"
        class="group border-border/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
      >
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between mb-3">
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
                <Globe class="w-3 h-3 mr-1" />
                Public
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings class="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy class="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive"
                  @click="openDeleteDialog(form)"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle
            class="text-lg font-bold text-balance leading-tight transition-colors"
          >
            {{ form.title }}
          </CardTitle>
          <CardDescription
            class="text-sm text-muted-foreground mt-1 text-pretty line-clamp-2"
          >
            {{ form.description || "No description provided" }}
          </CardDescription>
        </CardHeader>

        <CardContent class="pt-0 space-y-4">
          <!-- Creator Info -->
          <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Avatar class="w-8 h-8">
              <AvatarImage :src="form.creator.image || ''" />
              <AvatarFallback
                class="bg-accent text-accent-foreground text-xs font-medium"
              >
                {{ getInitials(form.creator.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">
                {{ form.creator.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatDate(form.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Form Details -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Price</span>
              <span class="font-semibold text-foreground"
                >Ksh {{ parseFloat(form.price).toFixed(2) }}</span
              >
            </div>

            <div
              class="flex items-center justify-between text-sm"
              v-if="form.allowGroups"
            >
              <span class="text-muted-foreground">Group Limit</span>
              <span class="font-medium text-foreground"
                >{{ form.groupMemberLimit }} members</span
              >
            </div>
          </div>

          <!-- Tags -->
          <div
            class="flex flex-wrap gap-1"
            v-if="form.tags && form.tags.length > 0"
          >
            <Badge
              v-for="tag in form.tags.slice(0, 2)"
              :key="tag"
              variant="outline"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
            <Badge
              v-if="form.tags.length > 2"
              variant="outline"
              class="text-xs"
            >
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
                <Eye class="w-4 h-4 mr-2" />
                View
              </NuxtLink>
              <Button
                variant="secondary"
                size="sm"
                class="w-full"
                @click="toggleShareModal(form)"
              >
                <Share class="w-4 h-4 mr-2" />
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
                <Edit class="w-4 h-4 mr-2" />
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
                <Users class="w-4 h-4 mr-2" />
                Submissions
              </NuxtLink>
            </div>

            <!-- Additional Actions -->
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" class="flex-1">
                <BarChart3 class="w-4 h-4 mr-2" />
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
                <Users2 class="h-4 w-4 mr-2" />
                Groups
              </NuxtLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <div v-if="forms?.data.length === 0" class="col-span-full">
        <Card class="border-dashed border-2 border-border/50">
          <CardContent class="flex flex-col items-center justify-center py-12">
            <FileText class="w-12 h-12 text-muted-foreground mb-4" />
            <h3 class="text-lg font-semibold text-foreground mb-2">
              No forms found
            </h3>
            <p class="text-muted-foreground text-center mb-4">
              Try adjusting your filters or create a new form to get started.
            </p>
            <NuxtLink :to="'/forms/new'" :class="buttonVariants()">
              <Plus class="w-4 h-4 mr-2" />
              Create New Form
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
            Delete Form
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ formToDelete?.title }}"?<br />
            <span class="font-medium text-destructive">
              This action cannot be undone.
            </span>
            All submissions, responses, and associated data will be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="deleteForm"
            :disabled="isDeleting"
            class="bg-destructive hover:bg-destructive/90"
          >
            <Loader v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
            <Trash2 v-else class="w-4 h-4 mr-2" />
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
