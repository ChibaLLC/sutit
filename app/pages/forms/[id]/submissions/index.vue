<script setup lang="ts">
import { NuxtLink } from "#components";
import { ref, computed, watch } from "vue";
import {
  Search,
  FileSpreadsheet,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Filter,
  Calendar,
  X,
  Loader,
  OctagonMinus,
  RotateCwIcon,
  RefreshCw,
  AlertCircle,
  Info,
  DollarSign,
  Truck,
  Package,
  PackageCheck,
} from "lucide-vue-next";
import { authHeaders } from "~/lib/auth-client";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();

const loading = ref({
  downloadExcel: false,
  submissions: false,
  refreshing: false,
  dispatching: false,
  delivering: false,
});

const error = ref<string | null>(null);

const activeTab = ref("active");
const filtersVisible = ref(true);

const filters = ref({
  search: "",
  status: "all",
  dispatchStatus: "all",
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

const { data: form } = await useFetch(`/api/forms/${route.params.id}`, {
  method: "get",
  headers: {
    ...(await authHeaders()),
  },
});
const acceptingResponses = ref(form.value.acceptResponses);

const {
  data: submissions,
  refresh,
  pending,
} = await useFetch(`/api/forms/${route.params.id}/submissions`, {
  method: "get",
  headers: {
    ...(await authHeaders()),
  },
  query: filters,
  server: false,
});

watch(pending, (isPending) => {
  loading.value.submissions = isPending;
  loading.value.refreshing = isPending;
});

const formFields = computed(() => {
  if (!submissions.value?.data?.length) return [];
  const fieldsMap = new Map();
  submissions.value.data.forEach((submission) => {
    if (submission.responses) {
      submission.responses.forEach((response) => {
        if (!fieldsMap.has(response.field.id)) {
          fieldsMap.set(response.field.id, {
            id: response.field.id,
            label: response.field.label,
            name: response.field.name,
            type: response.field.type,
            orderIndex: response.field.orderIndex || 0,
          });
        }
      });
    }
  });
  return Array.from(fieldsMap.values()).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
});

const getFieldValue = (submission, fieldId) => {
  if (!submission.responses) return "";
  const response = submission.responses.find((r) => r.fieldId === fieldId);
  return response?.value || "";
};

const filteredSubmissions = computed(() => {
  if (!submissions.value?.data) return [];
  let filtered = [...submissions.value.data];

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    filtered = filtered.filter((submission) => {
      const basicMatch =
        submission.submitter?.name?.toLowerCase().includes(searchTerm) ||
        submission.submitter?.email?.toLowerCase().includes(searchTerm) ||
        submission.id.toLowerCase().includes(searchTerm) ||
        submission.status?.toLowerCase().includes(searchTerm);
      const fieldMatch =
        submission.responses?.some((response) =>
          response.value?.toString().toLowerCase().includes(searchTerm),
        ) || false;
      return basicMatch || fieldMatch;
    });
  }

  if (filters.value.status !== "all") {
    filtered = filtered.filter((s) => s.status === filters.value.status);
  }

  if (filters.value.dispatchStatus !== "all") {
    filtered = filtered.filter((s) => {
      const dStatus = s.dispatch?.status || "none";
      return dStatus === filters.value.dispatchStatus;
    });
  }

  if (filters.value.dateRange.start) {
    const startDate = new Date(filters.value.dateRange.start);
    filtered = filtered.filter((s) => new Date(s.submittedAt) >= startDate);
  }

  if (filters.value.dateRange.end) {
    const endDate = new Date(filters.value.dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter((s) => new Date(s.submittedAt) <= endDate);
  }

  if (filters.value.priceRange.min) {
    filtered = filtered.filter(
      (s) => (s.pricePaid || 0) >= parseFloat(filters.value.priceRange.min),
    );
  }

  if (filters.value.priceRange.max) {
    filtered = filtered.filter(
      (s) => (s.pricePaid || 0) <= parseFloat(filters.value.priceRange.max),
    );
  }

  if (filters.value.hasStoreItems !== "all") {
    const hasItems = filters.value.hasStoreItems === "yes";
    filtered = filtered.filter((s) => {
      const hasStoreItems = s.storeResponses?.length > 0;
      return hasItems ? hasStoreItems : !hasStoreItems;
    });
  }

  filtered.sort((a, b) => {
    let aValue, bValue;
    switch (filters.value.sortBy) {
      case "submittedAt":
        aValue = new Date(a.submittedAt);
        bValue = new Date(b.submittedAt);
        break;
      case "pricePaid":
        aValue = a.pricePaid || 0;
        bValue = b.pricePaid || 0;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.submittedAt;
        bValue = b.submittedAt;
    }
    if (aValue < bValue) return filters.value.sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return filters.value.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
});

const stats = computed(() => {
  const data = filteredSubmissions.value;
  const total = data.length;
  const completed = data.filter((s) => s.status === "completed").length;
  const pending = data.filter((s) => s.status === "pending").length;
  const failedPayment = data.filter(
    (s) => s.status === "failed_payment",
  ).length;
  const totalRevenue = data.reduce((sum, s) => sum + (s.pricePaid ?? 0), 0);
  const storeRevenue = data.reduce(
    (sum, s) =>
      sum +
      (s.storeResponses?.reduce(
        (storeSum, sr) => storeSum + (sr.total || 0),
        0,
      ) || 0),
    0,
  );
  const withProducts = data.filter((s) => s.storeResponses?.length > 0).length;
  const pendingDispatch = data.filter(
    (s) => s.storeResponses?.length > 0 && !s.dispatch,
  ).length;
  const dispatched = data.filter(
    (s) => s.dispatch?.status === "dispatched",
  ).length;
  const delivered = data.filter(
    (s) => s.dispatch?.status === "delivered",
  ).length;

  return {
    total,
    completed,
    pending,
    failedPayment,
    totalRevenue,
    storeRevenue,
    withProducts,
    pendingDispatch,
    dispatched,
    delivered,
  };
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSubmissions.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredSubmissions.value.length / itemsPerPage.value),
);

watch(
  filters,
  () => {
    currentPage.value = 1;
    refresh();
  },
  { deep: true },
);

const formatCurrency = (amount: number) => {
  return `Kes ${amount.toLocaleString()}`;
};

const clearFilters = () => {
  filters.value = {
    search: "",
    status: "all",
    dispatchStatus: "all",
    dateRange: { start: "", end: "" },
    priceRange: { min: "", max: "" },
    hasStoreItems: "all",
    sortBy: "submittedAt",
    sortOrder: "desc",
  };
};

const formatFieldValue = (value, fieldType) => {
  if (!value) return "-";
  switch (fieldType) {
    case "date":
      return new Date(value).toLocaleDateString();
    case "textarea":
      return value.length > 50 ? value.substring(0, 50) + "..." : value;
    default:
      return value;
  }
};

const downloadExcel = async () => {
  loading.value.downloadExcel = true;
  try {
    const res = await $fetch(
      `/api/forms/${route.params.id}/submissions/excel`,
      { method: "GET", responseType: "blob" },
    );
    const blob = new Blob([res], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Submissions.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e: any) {
  } finally {
    loading.value.downloadExcel = false;
  }
};

const toggleReponse = async () => {
  try {
    const res = await $fetch(`/api/forms/${form.value.id}/accept`, {
      method: "post",
    });
    toast.success(res.message);
    acceptingResponses.value = !acceptingResponses.value;
    await refresh();
  } catch (e) {}
};

// Dispatch dialog state
const dispatchDialogOpen = ref(false);
const dispatchForm = ref({
  submissionId: "",
  dispatchedBy: "",
  dispatchDate: new Date().toISOString().split("T")[0],
  notes: "",
});

const openDispatchDialog = (submission) => {
  dispatchForm.value = {
    submissionId: submission.id,
    dispatchedBy: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    notes: "",
  };
  dispatchDialogOpen.value = true;
};

const submitDispatch = async () => {
  if (!dispatchForm.value.dispatchedBy || !dispatchForm.value.dispatchDate) {
    toast.error("Please fill in all required fields");
    return;
  }
  loading.value.dispatching = true;
  try {
    await $fetch(
      `/api/forms/${route.params.id}/submissions/${dispatchForm.value.submissionId}/dispatch`,
      {
        method: "POST",
        body: {
          dispatchedBy: dispatchForm.value.dispatchedBy,
          dispatchDate: dispatchForm.value.dispatchDate,
          notes: dispatchForm.value.notes,
        },
      },
    );
    toast.success("Submission dispatched successfully");
    dispatchDialogOpen.value = false;
    await refresh();
  } catch (e: any) {
    toast.error(e.data?.message || "Failed to dispatch");
  } finally {
    loading.value.dispatching = false;
  }
};

// Deliver dialog state
const deliverDialogOpen = ref(false);
const deliverForm = ref({
  submissionId: "",
  deliveryDate: new Date().toISOString().split("T")[0],
});

const openDeliverDialog = (submission) => {
  deliverForm.value = {
    submissionId: submission.id,
    deliveryDate: new Date().toISOString().split("T")[0],
  };
  deliverDialogOpen.value = true;
};

const submitDeliver = async () => {
  if (!deliverForm.value.deliveryDate) {
    toast.error("Please set a delivery date");
    return;
  }
  loading.value.delivering = true;
  try {
    await $fetch(
      `/api/forms/${route.params.id}/submissions/${deliverForm.value.submissionId}/dispatch/deliver`,
      {
        method: "POST",
        body: {
          deliveryDate: deliverForm.value.deliveryDate,
        },
      },
    );
    toast.success("Marked as delivered");
    deliverDialogOpen.value = false;
    await refresh();
  } catch (e: any) {
    toast.error(e.data?.message || "Failed to mark as delivered");
  } finally {
    loading.value.delivering = false;
  }
};

const getDispatchBadge = (submission) => {
  if (!submission.storeResponses?.length) return null;
  const status = submission.dispatch?.status;
  if (!status) return { label: "Pending Dispatch", variant: "outline", class: "text-yellow-700 border-yellow-300" };
  if (status === "dispatched") return { label: "Dispatched", variant: "outline", class: "text-blue-700 border-blue-300" };
  if (status === "delivered") return { label: "Delivered", variant: "outline", class: "text-green-700 border-green-300" };
  return null;
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
              <Switch @click="toggleReponse()" v-model="acceptingResponses" />
            </div>

            <!-- Refresh button -->
            <Button
              @click.prevent="refresh()"
              size="sm"
              variant="outline"
              class="gap-2"
              :disabled="loading.refreshing"
            >
              <Loader v-if="loading.refreshing" class="animate-spin" />
              <RefreshCw v-else class="w-4 h-4" />
              <span class="hidden sm:inline">Refresh</span>
            </Button>

            <!-- Export buttons -->
            <Button
              @click.prevent="downloadExcel()"
              size="sm"
              variant="outline"
              class="gap-2"
              :disabled="loading.downloadExcel"
            >
              <Loader v-if="loading.downloadExcel" />
              <FileSpreadsheet class="w-4 h-4" />
              <span class="hidden sm:inline">Excel</span>
            </Button>
            <Button
              v-if="form?.calculateTat"
              :to="`/forms/${route.params.id}/submissions/tat`"
              :as="NuxtLink"
              size="sm"
              variant="outline"
              class="gap-2"
            >
              <RotateCwIcon class="w-4 h-4" />
              <span class="hidden sm:inline">Manage TAT</span>
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
          {{ form?.title }}
        </h2>
        <p class="text-muted-foreground mt-1">
          {{ formFields.length }} fields • {{ stats.total }} submissions
        </p>
      </Card>

      <!-- Dashboard Stats -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6"
      >
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Total Submissions
              </p>
              <p class="text-2xl font-bold">{{ stats.total }}</p>
            </div>
            <div
              class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <FileSpreadsheet class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Completed</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.completed }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center"
            >
              <Eye class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats.pending }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center"
            >
              <Loader class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6" v-if="stats.failedPayment > 0">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Failed Payments
              </p>
              <p class="text-2xl font-bold text-red-600">
                {{ stats.failedPayment }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center"
            >
              <CreditCard class="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p class="text-2xl font-bold">
                {{ formatCurrency(stats.totalRevenue + stats.storeRevenue) }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <CreditCard class="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Pending Dispatch
              </p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats.pendingDispatch }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center"
            >
              <Package class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Dispatched</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ stats.dispatched }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <Truck class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Delivered</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.delivered }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center"
            >
              <PackageCheck class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Tabs -->
      <Card class="mb-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-1">
            <TabsTrigger value="active">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="active" class="mt-6">
            <!-- Enhanced Filters Section -->
            <Card class="mb-6 p-6">
              <div class="space-y-6">
                <!-- Filter Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Filter class="w-5 h-5 text-muted-foreground" />
                    <h3 class="text-lg font-semibold">Filters</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="filtersVisible = !filtersVisible"
                      class="gap-2"
                    >
                      <ChevronUp v-if="filtersVisible" class="w-4 h-4" />
                      <ChevronDown v-else class="w-4 h-4" />
                      {{ filtersVisible ? "Hide" : "Show" }} Filters
                    </Button>
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
                </div>

                <!-- Filter Controls -->
                <div v-if="filtersVisible" class="space-y-6">
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    <!-- Search -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Search</Label>
                      <div class="relative">
                        <Search
                          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                          v-model="filters.search"
                          placeholder="Search in all fields..."
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
                          <SelectItem value="failed_payment"
                            >Payment Failed</SelectItem
                          >
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Dispatch Status Filter -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Dispatch Status</Label>
                      <Select v-model="filters.dispatchStatus">
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="none">Pending Dispatch</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
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
                    <Badge
                      v-if="filters.search"
                      variant="secondary"
                      class="gap-1"
                    >
                      Search: {{ filters.search }}
                      <X
                        class="w-3 h-3 cursor-pointer"
                        @click="filters.search = ''"
                      />
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
              </div>
            </Card>

            <!-- Enhanced Table Section with Dynamic Columns -->
            <Card class="overflow-hidden">
              <!-- Loading State -->
              <div
                v-if="loading.submissions"
                class="flex items-center justify-center py-12"
              >
                <Loader class="h-8 w-8 text-muted-foreground animate-spin" />
                <span class="ml-2 text-muted-foreground"
                  >Loading submissions...</span
                >
              </div>

              <!-- Empty State -->
              <div
                v-else-if="!submissions?.data?.length"
                class="flex flex-col items-center justify-center py-12"
              >
                <Info class="h-12 w-12 text-muted-foreground mb-4" />
                <p class="text-lg font-medium text-foreground">
                  No submissions found
                </p>
                <p class="text-sm text-muted-foreground">
                  Submissions will appear here once users submit the form
                </p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[1000px]">
                  <thead class="bg-muted/30 border-b">
                    <tr>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[120px]"
                      >
                        Submission ID
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[150px]"
                      >
                        Submitter
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[80px]"
                      >
                        Status
                      </th>
                      <!-- Dynamic form field headers -->
                      <th
                        v-for="field in formFields"
                        :key="field.id"
                        class="text-left px-4 py-3 font-medium text-sm min-w-[120px]"
                        :title="field.name"
                      >
                        {{ field.label }}
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[100px]"
                      >
                        Price Paid
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[120px]"
                      >
                        Payment Ref
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[120px]"
                      >
                        Store Items
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[120px]"
                      >
                        Dispatch Status
                      </th>
                      <th
                        class="text-left px-4 py-3 font-medium text-sm min-w-[140px]"
                      >
                        Submitted At
                      </th>
                      <th
                        class="text-right px-4 py-3 font-medium text-sm min-w-[100px]"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="submission in paginatedSubmissions"
                      :key="submission.id"
                      class="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td class="px-4 py-4">
                        <span
                          class="font-medium text-primary text-sm"
                          :title="submission.id"
                        >
                          {{ submission.id.slice(0, 8) }}...
                        </span>
                      </td>
                      <td class="px-4 py-4">
                        <div>
                          <p class="font-medium">
                            {{ submission?.submitter?.name || "N/A" }}
                          </p>
                          <p class="text-xs text-muted-foreground">
                            {{ submission?.submitter?.email || "N/A" }}
                          </p>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <Badge
                          :variant="
                            submission.status === 'completed'
                              ? 'default'
                              : submission.status === 'failed_payment'
                                ? 'destructive'
                                : 'secondary'
                          "
                          :class="{
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-100':
                              submission.status === 'pending',
                            'bg-red-100 text-red-800 hover:bg-red-100':
                              submission.payments
                                ? submission.payments.payment?.status ===
                                  'failed'
                                : false,
                          }"
                          class="capitalize"
                        >
                          {{
                            submission.payments
                              ? submission.payments.payment?.status
                              : submission.status
                          }}
                        </Badge>
                      </td>
                      <!-- Dynamic form field values -->
                      <td
                        v-for="field in formFields"
                        :key="field.id"
                        class="px-4 py-4 text-sm"
                        :title="getFieldValue(submission, field.id)"
                      >
                        <span class="text-muted-foreground">
                          {{
                            formatFieldValue(
                              getFieldValue(submission, field.id),
                              field.type,
                            )
                          }}
                        </span>
                      </td>
                      <td class="px-4 py-4">
                        <span class="font-medium">
                          {{ formatCurrency(submission.pricePaid || 0) }}
                        </span>
                      </td>
                      <td class="px-4 py-4">
                        <span
                          v-if="
                            submission.payments?.[0]?.payment?.referenceCode
                          "
                          class="text-sm font-mono"
                        >
                          {{ submission.payments[0].payment.referenceCode }}
                        </span>
                        <span v-else class="text-muted-foreground text-sm"
                          >-</span
                        >
                      </td>
                      <td class="px-4 py-4">
                        <div
                          v-if="submission.storeResponses?.length > 0"
                          class="space-y-1"
                        >
                          <div
                            v-for="item in submission.storeResponses.slice(
                              0,
                              2,
                            )"
                            :key="item.item?.name || 'item'"
                            class="text-sm"
                          >
                            <span class="font-medium">{{
                              item.item?.name || "Item"
                            }}</span>
                            <span class="text-muted-foreground">
                              ({{ item.quantity || 0 }}x)</span
                            >
                          </div>
                          <span
                            v-if="submission.storeResponses.length > 2"
                            class="text-xs text-muted-foreground"
                          >
                            +{{ submission.storeResponses.length - 2 }} more
                          </span>
                        </div>
                        <span v-else class="text-muted-foreground text-sm"
                          >No items</span
                        >
                      </td>
                      <td class="px-4 py-4">
                        <template v-if="submission.storeResponses?.length > 0">
                          <Badge
                            v-if="getDispatchBadge(submission)"
                            :variant="getDispatchBadge(submission).variant"
                            :class="getDispatchBadge(submission).class"
                          >
                            {{ getDispatchBadge(submission).label }}
                          </Badge>
                          <span v-if="submission.dispatch?.dispatchedAt" class="block text-xs text-muted-foreground mt-1">
                            {{ new Date(submission.dispatch.dispatchedAt).toLocaleDateString() }}
                          </span>
                        </template>
                        <span v-else class="text-muted-foreground text-sm">-</span>
                      </td>
                      <td class="px-4 py-4">
                        <span class="text-sm text-muted-foreground">
                          {{ formatDate(submission.submittedAt) }}
                        </span>
                      </td>
                      <td class="px-4 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <NuxtLink
                            :to="`/forms/${form.id}/submissions/${submission.id}`"
                            as-child
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              class="h-8 w-8 p-0"
                              title="View"
                            >
                              <Eye class="h-4 w-4" />
                            </Button>
                          </NuxtLink>

                          <Button
                            v-if="submission.storeResponses?.length > 0 && !submission.dispatch"
                            size="sm"
                            variant="ghost"
                            class="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Dispatch"
                            @click="openDispatchDialog(submission)"
                          >
                            <Truck class="h-4 w-4" />
                          </Button>

                          <Button
                            v-if="submission.dispatch?.status === 'dispatched'"
                            size="sm"
                            variant="ghost"
                            class="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Mark Delivered"
                            @click="openDeliverDialog(submission)"
                          >
                            <PackageCheck class="h-4 w-4" />
                          </Button>

                          <NuxtLink
                            :to="`/submission/${submission.id}/stop-tat`"
                            as-child
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              class="h-8 w-8 p-0"
                              title="Stop TAT"
                            >
                              <OctagonMinus class="h-4 w-4" />
                            </Button>
                          </NuxtLink>

                          <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit class="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Enhanced Pagination -->
              <div
                class="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4"
              >
                <div class="flex items-center gap-4">
                  <p class="text-sm text-muted-foreground">
                    Showing
                    {{
                      Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        stats.total,
                      )
                    }}
                    to
                    {{ Math.min(currentPage * itemsPerPage, stats.total) }}
                    of {{ stats.total }} results
                  </p>
                  <Select v-model="itemsPerPage">
                    <SelectTrigger class="w-20">
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
                    <span
                      v-if="totalPages > 5"
                      class="text-muted-foreground px-2"
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
          </TabsContent>
        </Tabs>
      </Card>

      <!-- Dispatch Dialog -->
      <AlertDialog v-model:open="dispatchDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <Truck class="w-5 h-5" />
              Dispatch Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set the dispatch details for this submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Dispatched By</Label>
              <Input
                v-model="dispatchForm.dispatchedBy"
                placeholder="Name of person dispatching"
              />
            </div>
            <div class="space-y-2">
              <Label>Dispatch Date</Label>
              <Input v-model="dispatchForm.dispatchDate" type="date" />
            </div>
            <div class="space-y-2">
              <Label>Notes (optional)</Label>
              <Input v-model="dispatchForm.notes" placeholder="Any notes" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitDispatch" :disabled="loading.dispatching">
              <Loader v-if="loading.dispatching" class="w-4 h-4 mr-2 animate-spin" />
              Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Deliver Dialog -->
      <AlertDialog v-model:open="deliverDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <PackageCheck class="w-5 h-5" />
              Mark as Delivered
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set the delivery date. The user will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Delivery Date</Label>
              <Input v-model="deliverForm.deliveryDate" type="date" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitDeliver" :disabled="loading.delivering">
              <Loader v-if="loading.delivering" class="w-4 h-4 mr-2 animate-spin" />
              Mark Delivered
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  </div>
</template>
