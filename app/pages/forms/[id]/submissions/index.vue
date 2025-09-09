<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Search,
  FileSpreadsheet,
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  X,
} from "lucide-vue-next";
import { authHeaders } from "~/lib/auth-client";

const route = useRoute(); // Using Nuxt's auto-imported version
const acceptingResponses = ref(true);

const filters = ref({
  search: "",
  status: "all",
  dateRange: {
    start: "",
    end: "",
  },
  priceRange: {
    min: "",
    max: "",
  },
  hasStoreItems: "all",
  sortBy: "submittedAt",
  sortOrder: "desc",
});
const { data: submissions } = await useFetch(
  `/api/forms/${route.params.id}/submissions`,
  {
    method: "get",
    headers: {
      ...(await authHeaders()),
    },
    query: filters,
  },
);
const stats = computed(() => {
  const total = submissions.value?.data.length;
  const completed = submissions.value?.data.filter(
    (s) => s.status === "completed",
  ).length;
  const pending = submissions.value?.data.filter(
    (s) => s.status === "pending",
  ).length;
  const totalRevenue = submissions.value?.data.reduce(
    (sum, s) => sum + (s.pricePaid ?? 0),
    0,
  );
  const storeRevenue = submissions.value?.data.reduce(
    (sum, s) =>
      sum + s.storeResponses.reduce((storeSum, sr) => storeSum + sr.total, 0),
    0,
  );

  return {
    total,
    completed,
    pending,
    totalRevenue,
    storeRevenue,
  };
});

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = computed(() =>
  Math.ceil(submissions.value?.data.length / itemsPerPage.value),
);

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return submissions.value?.data.slice(start, end);
});

const formatCurrency = (amount: number) => {
  return `Kes ${amount.toLocaleString()}`;
};

const clearFilters = () => {
  filters.value = {
    search: "",
    status: "all",
    dateRange: { start: "", end: "" },
    priceRange: { min: "", max: "" },
    hasStoreItems: "all",
    sortBy: "submittedAt",
    sortOrder: "desc",
  };
};

const getResponseValue = (responses: any[], fieldId: string) => {
  const response = responses.find((r) => r.fieldId === fieldId);
  return response?.value || "-";
};
</script>

<template>
  <div>
    <main class="container mx-auto px-4 py-8 max-w-[1440px]">
      <!-- Header Section -->
      <div class="mb-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 class="text-3xl font-bold text-foreground">Form Submissions</h1>
            <p class="text-muted-foreground mt-1">
              Manage and track all your form submissions
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <!-- Accepting responses toggle -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-muted-foreground"
                >Accepting Responses</span
              >
              <button
                @click="acceptingResponses = !acceptingResponses"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  acceptingResponses ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    acceptingResponses ? 'translate-x-6' : 'translate-x-1',
                  ]"
                />
              </button>
            </div>

            <!-- Export buttons -->
            <Button size="sm" variant="outline" class="gap-2">
              <FileSpreadsheet class="w-4 h-4" />
              <span class="hidden sm:inline">Excel</span>
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <CreditCard class="w-4 h-4" />
              <span class="hidden sm:inline">Credit</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Form Title -->
      <Card class="mb-6 p-6">
        <h2 class="text-2xl font-bold text-foreground">
          {{ submissions?.data[0].form.title || "Form Submissions" }}
        </h2>
      </Card>

      <!-- Enhanced Stats Grid with better responsive design -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card
          class="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileSpreadsheet
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">
                Total
              </p>
              <p class="text-2xl font-bold text-foreground">
                {{ stats.total }}
              </p>
            </div>
          </div>
        </Card>

        <Card
          class="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">
                Completed
              </p>
              <p class="text-2xl font-bold text-foreground">
                {{ stats.completed }}
              </p>
            </div>
          </div>
        </Card>

        <Card
          class="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">
                Pending
              </p>
              <p class="text-2xl font-bold text-foreground">
                {{ stats.pending }}
              </p>
            </div>
          </div>
        </Card>

        <Card
          class="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 col-span-2 sm:col-span-1"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <DollarSign
                class="w-5 h-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">
                Revenue
              </p>
              <p class="text-2xl font-bold text-primary">
                {{ formatCurrency(stats.totalRevenue) }}
              </p>
            </div>
          </div>
        </Card>

        <Card
          class="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 col-span-2 sm:col-span-2 lg:col-span-1"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <CreditCard
                class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">
                Store Sales
              </p>
              <p class="text-2xl font-bold text-primary">
                {{ formatCurrency(stats.storeRevenue) }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Enhanced Filters Section with comprehensive filtering -->
      <Card class="mb-6 p-6">
        <div class="space-y-6">
          <!-- Filter Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Filter class="w-5 h-5 text-muted-foreground" />
              <h3 class="text-lg font-semibold">Filters</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="clearFilters"
              class="gap-2"
            >
              <X class="w-4 h-4" />
              Clear All
            </Button>
          </div>

          <!-- Filter Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Search</Label>
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="filters.search"
                  placeholder="Search submissions..."
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Status</Label>
              <Select v-model="filters.status">
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Date Range Start -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Start Date</Label>
              <div class="relative">
                <Calendar
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="filters.dateRange.start"
                  type="date"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Date Range End -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">End Date</Label>
              <div class="relative">
                <Calendar
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="filters.dateRange.end"
                  type="date"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Price Range Min -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Min Price</Label>
              <div class="relative">
                <DollarSign
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="filters.priceRange.min"
                  type="number"
                  placeholder="0"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Price Range Max -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Max Price</Label>
              <div class="relative">
                <DollarSign
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="filters.priceRange.max"
                  type="number"
                  placeholder="10000"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Store Items Filter -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Store Items</Label>
              <Select v-model="filters.hasStoreItems">
                <SelectTrigger>
                  <SelectValue placeholder="All submissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="yes">With Store Items</SelectItem>
                  <SelectItem value="no">Without Store Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Sort Options -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">Sort By</Label>
              <div class="flex gap-2">
                <Select v-model="filters.sortBy" class="flex-1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submittedAt">Date</SelectItem>
                    <SelectItem value="pricePaid">Price</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  @click="
                    filters.sortOrder =
                      filters.sortOrder === 'asc' ? 'desc' : 'asc'
                  "
                  class="px-3"
                >
                  <ChevronDown
                    :class="{ 'rotate-180': filters.sortOrder === 'asc' }"
                    class="w-4 h-4 transition-transform"
                  />
                </Button>
              </div>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div
            v-if="
              filters.search ||
              filters.status !== 'all' ||
              filters.dateRange.start ||
              filters.dateRange.end
            "
            class="flex flex-wrap gap-2"
          >
            <Badge v-if="filters.search" variant="secondary" class="gap-1">
              Search: {{ filters.search }}
              <X class="w-3 h-3 cursor-pointer" @click="filters.search = ''" />
            </Badge>
            <Badge
              v-if="filters.status !== 'all'"
              variant="secondary"
              class="gap-1"
            >
              Status: {{ filters.status }}
              <X
                class="w-3 h-3 cursor-pointer"
                @click="filters.status = 'all'"
              />
            </Badge>
            <Badge
              v-if="filters.dateRange.start"
              variant="secondary"
              class="gap-1"
            >
              From: {{ filters.dateRange.start }}
              <X
                class="w-3 h-3 cursor-pointer"
                @click="filters.dateRange.start = ''"
              />
            </Badge>
            <Badge
              v-if="filters.dateRange.end"
              variant="secondary"
              class="gap-1"
            >
              To: {{ filters.dateRange.end }}
              <X
                class="w-3 h-3 cursor-pointer"
                @click="filters.dateRange.end = ''"
              />
            </Badge>
          </div>
        </div>
      </Card>

      <!-- Enhanced Table Section with better responsive design -->
      <Card class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px]">
            <thead class="bg-muted/50 border-b">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  Submission ID
                </th>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  Submitter
                </th>
                <th class="text-left px-4 py-3 font-medium text-sm">Email</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Status</th>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  Price Paid
                </th>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  Store Items
                </th>
                <th class="text-left px-4 py-3 font-medium text-sm">Date</th>
                <th class="text-right px-4 py-3 font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="submission in submissions?.data"
                :key="submission.id"
                class="border-b hover:bg-muted/30 transition-colors"
              >
                <td class="px-4 py-4">
                  <span class="font-medium text-primary text-sm"
                    >{{ submission.id.slice(0, 8) }}...</span
                  >
                </td>
                <td class="px-4 py-4">
                  <div>
                    <p class="font-medium">{{ submission.submitter.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{
                        submission.metadata.paymentData?.phoneNumber || "N/A"
                      }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{
                    submission.submitter.email
                  }}</span>
                </td>
                <td class="px-4 py-4">
                  <Badge
                    :variant="
                      submission.status === 'completed'
                        ? 'default'
                        : 'secondary'
                    "
                  >
                    {{ submission.status }}
                  </Badge>
                </td>
                <td class="px-4 py-4">
                  <span class="font-medium">{{
                    formatCurrency(submission.pricePaid)
                  }}</span>
                </td>
                <td class="px-4 py-4">
                  <div
                    v-if="submission.storeResponses.length > 0"
                    class="space-y-1"
                  >
                    <div
                      v-for="item in submission.storeResponses"
                      :key="item.item.name"
                      class="text-sm"
                    >
                      <span class="font-medium">{{ item.item.name }}</span>
                      <span class="text-muted-foreground">
                        ({{ item.quantity }}x)</span
                      >
                    </div>
                  </div>
                  <span v-else class="text-muted-foreground text-sm"
                    >No items</span
                  >
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{
                    formatDate(submission.submittedAt)
                  }}</span>
                </td>
                <td class="px-4 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Enhanced Pagination with better responsive design -->
        <div
          class="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4"
        >
          <div class="flex items-center gap-4">
            <p class="text-sm text-muted-foreground">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
              {{
                Math.min(currentPage * itemsPerPage, submissions?.data.length)
              }}
              of {{ submissions?.data.length }} results
            </p>
            <Select v-model="itemsPerPage" class="w-20">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="5">5</SelectItem>
                <SelectItem :value="10">10</SelectItem>
                <SelectItem :value="25">25</SelectItem>
                <SelectItem :value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <ChevronLeft class="h-4 w-4" />
              <span class="hidden sm:inline ml-1">Previous</span>
            </Button>

            <div class="flex items-center gap-1">
              <Button
                v-for="page in Math.min(totalPages, 5)"
                :key="page"
                :variant="currentPage === page ? 'default' : 'outline'"
                size="sm"
                class="w-8 h-8 p-0"
                @click="currentPage = page"
              >
                {{ page }}
              </Button>
              <span v-if="totalPages > 5" class="text-muted-foreground px-2"
                >...</span
              >
            </div>

            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <span class="hidden sm:inline mr-1">Next</span>
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>
