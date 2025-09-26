<script setup lang="ts">
import {
  FileText,
  Plus,
  Sun,
  Moon,
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
} from "lucide-vue-next";
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

const { data: forms } = await useFetch("/api/forms", {
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
// Computed properties for stats (updated to use forms)
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

// Filter and pagination methods
const clearFilters = () => {};

const toggleSortOrder = () => {};
const toggleShareModal = (form?: FormSchema) => {
  if (form) {
    selectedForm.value = form;
  }
  shareModalOpen.value = !shareModalOpen.value;
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
          <NuxtLink to="/forms/new" :class="buttonVariants()">
            <Plus class="w-4 h-4 mr-2" />
            New Form
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p class="text-sm font-medium text-muted-foreground">Published</p>
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
    </div>

    <!-- Filters Section -->
    <div class="mb-8">
      <Card class="border-border/50">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">Filter Forms</CardTitle>
          <CardDescription
            >Search and filter your forms by various criteria</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Search</label>
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
              <label class="text-sm font-medium text-foreground">Status</label>
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
              <Button variant="outline" size="sm" @click="clearFilters">
                <X class="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
              <Badge variant="secondary" class="text-xs">
                {{ forms?.data.length }} of {{ forms?.data.length }} forms
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

    <!-- Forms Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
    >
      <Card
        v-for="form in forms?.data"
        :key="form.id"
        class="group border-border/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
      >
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Badge
                  :variant="
                    form.status === 'published' ? 'default' : 'secondary'
                  "
                  class="text-xs font-medium"
                  :class="{
                    'bg-chart-3 hover:bg-chart-3/90':
                      form.status === 'published',
                    'bg-chart-4 hover:bg-chart-4/90': form.status === 'draft',
                    'bg-muted hover:bg-muted/90': form.status === 'archived',
                  }"
                >
                  {{
                    form.status.charAt(0).toUpperCase() + form.status.slice(1)
                  }}
                </Badge>
                <Badge v-if="form.isPublic" variant="outline" class="text-xs">
                  <Globe class="w-3 h-3 mr-1" />
                  Public
                </Badge>
              </div>
              <CardTitle
                class="text-lg font-bold text-balance leading-tight transition-colors"
              >
                {{ form.title }}
              </CardTitle>
              <CardDescription
                class="text-sm text-muted-foreground mt-1 text-pretty"
              >
                {{ form.description || "No description provided" }}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-8 h-8 p-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click.prevent="toggleShareModal(form)">
                  <Share class="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings class="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy class="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive">
                  <Trash2 class="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent class="pt-0">
          <!-- Creator Info -->
          <div class="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
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
          <div class="space-y-3 mb-4">
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

            <div
              class="flex flex-wrap gap-1 mt-2"
              v-if="form.tags && form.tags.length > 0"
            >
              <Badge
                v-for="tag in form.tags.slice(0, 3)"
                :key="tag"
                variant="outline"
                class="text-xs"
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
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" class="w-full">
              <BarChart3 class="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <NuxtLink
              :to="`/forms/${form.id}/submissions`"
              :class="
                buttonVariants({
                  class: 'w-full',
                  variant: 'outline',
                  size: 'sm',
                })
              "
            >
              <Users class="w-4 h-4 mr-2" />
              Submissions
            </NuxtLink>
            <NuxtLink
              :to="`/forms/${form.slug}`"
              :class="buttonVariants({ size: 'sm' })"
            >
              <Eye class="w-4 h-4 mr-2" />
              View Form
            </NuxtLink>
            <NuxtLink
              :class="
                buttonVariants({
                  variant: 'secondary',
                  size: 'sm',
                  class: 'w-full',
                })
              "
              :to="`/forms/${form.id}/edit`"
            >
              <Edit class="w-4 h-4 mr-2" />
              Edit
            </NuxtLink>
            <NuxtLink
              v-if="form.allowGroups"
              :to="`/forms/${form.id}/group`"
              :class="buttonVariants({ size: 'sm' })"
            >
              <Users2 class="h-4 w-4 mr-2" />
              Groups
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-2"></div>
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
            <Button class="bg-accent hover:bg-accent/90">
              <Plus class="w-4 h-4 mr-2" />
              Create New Form
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    <LazyFormsShareCard
      v-if="selectedForm"
      :form="selectedForm"
      :isOpen="shareModalOpen"
      @close="toggleShareModal()"
    />

    <!-- Pagination Component -->
    <!-- <div v-if="totalPages > 1" class="flex justify-center"> -->
    <!--   <Pagination> -->
    <!--     <PaginationContent> -->
    <!--       <PaginationItem> -->
    <!--         <PaginationPrevious -->
    <!--           @click="goToPage(currentPage - 1)" -->
    <!--           :class="{ 'pointer-events-none opacity-50': currentPage === 1 }" -->
    <!--         /> -->
    <!--       </PaginationItem> -->
    <!---->
    <!--       <PaginationItem v-for="page in visiblePages" :key="page"> -->
    <!--         <PaginationLink -->
    <!--           @click="goToPage(page)" -->
    <!--           :isActive="page === currentPage" -->
    <!--         > -->
    <!--           {{ page }} -->
    <!--         </PaginationLink> -->
    <!--       </PaginationItem> -->
    <!---->
    <!--       <PaginationItem> -->
    <!--         <PaginationNext -->
    <!--           @click="goToPage(currentPage + 1)" -->
    <!--           :class="{ -->
    <!--             'pointer-events-none opacity-50': currentPage === totalPages, -->
    <!--           }" -->
    <!--         /> -->
    <!--       </PaginationItem> -->
    <!--     </PaginationContent> -->
    <!--   </Pagination> -->
    <!-- </div> -->
  </div>
</template>
