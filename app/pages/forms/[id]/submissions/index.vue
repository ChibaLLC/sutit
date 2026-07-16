<script setup lang="ts">
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
    Banknote,
  } from "lucide-vue-next";
  import { ref, computed, watch } from "vue";
  import { toast } from "vue-sonner";

  import { NuxtLink } from "#components";
  import { authHeaders } from "~/lib/auth-client";

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
    retryingDisbursement: null as string | null,
  });

  const error = ref<string | null>(null);

  const activeTab = ref("active");
  const filtersVisible = ref(true);

  const filters = ref({
    search: "",
    status: "all",
    dispatchStatus: "all",
    batchId: "all",
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
    return Array.from(fieldsMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);
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

    if (filters.value.batchId !== "all") {
      filtered = filtered.filter((s) => {
        if (filters.value.batchId === "unbatched") return !s.dispatch?.batchId;
        return s.dispatch?.batchId === filters.value.batchId;
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
    const failedPayment = data.filter((s) => s.status === "failed_payment").length;
    const totalRevenue = data.reduce((sum, s) => sum + (s.pricePaid ?? 0), 0);
    const storeRevenue = data.reduce(
      (sum, s) =>
        sum + (s.storeResponses?.reduce((storeSum, sr) => storeSum + (sr.total || 0), 0) || 0),
      0,
    );
    const withProducts = data.filter((s) => s.storeResponses?.length > 0).length;
    const pendingDispatch = data.filter((s) => s.storeResponses?.length > 0 && !s.dispatch).length;
    const dispatched = data.filter((s) => s.dispatch?.status === "dispatched").length;
    const delivered = data.filter((s) => s.dispatch?.status === "delivered").length;

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
      batchId: "all",
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
      const res = await $fetch(`/api/forms/${route.params.id}/submissions/excel`, {
        method: "GET",
        responseType: "blob",
        query: {
          status: filters.value.status !== "all" ? filters.value.status : undefined,
          dispatchStatus:
            filters.value.dispatchStatus !== "all" ? filters.value.dispatchStatus : undefined,
          batchId: filters.value.batchId !== "all" ? filters.value.batchId : undefined,
          search: filters.value.search || undefined,
          dateStart: filters.value.dateRange.start || undefined,
          dateEnd: filters.value.dateRange.end || undefined,
        },
      });
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
    if (!status)
      return {
        label: "Pending Dispatch",
        variant: "outline",
        class: "text-yellow-700 border-yellow-300",
      };
    if (status === "dispatched")
      return { label: "Dispatched", variant: "outline", class: "text-blue-700 border-blue-300" };
    if (status === "delivered")
      return { label: "Delivered", variant: "outline", class: "text-green-700 border-green-300" };
    return null;
  };

  const getLatestDisbursement = (submission: any) => {
    const rows: any[] = [];
    for (const fp of submission.payments || []) {
      for (const d of fp.payment?.disbursements || []) {
        rows.push(d);
      }
    }
    if (!rows.length) return null;
    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  };

  const hasCompletedPayment = (submission: any) => {
    return (submission.payments || []).some((fp: any) => fp.payment?.status === "completed");
  };

  const getDisbursementBadge = (submission: any) => {
    if (!hasCompletedPayment(submission)) return null;
    const d = getLatestDisbursement(submission);
    if (!d) {
      return {
        label: "Not disbursed",
        class: "text-amber-700 border-amber-300",
      };
    }
    const map: Record<string, { label: string; class: string }> = {
      completed: { label: "Disbursed", class: "text-green-700 border-green-300" },
      failed: { label: "Disburse failed", class: "text-red-700 border-red-300" },
      processing: { label: "Disbursing", class: "text-blue-700 border-blue-300" },
      pending: { label: "Disburse pending", class: "text-yellow-700 border-yellow-300" },
    };
    return map[d.status] || { label: d.status, class: "" };
  };

  const canRetryDisbursement = (submission: any) => {
    if (!hasCompletedPayment(submission)) return false;
    const d = getLatestDisbursement(submission);
    return !d || d.status === "failed";
  };

  const retryDisbursement = async (submission: any) => {
    loading.value.retryingDisbursement = submission.id;
    try {
      const res = await $fetch(
        `/api/forms/${route.params.id}/submissions/${submission.id}/retry-disbursement`,
        {
          method: "POST",
          headers: { ...(await authHeaders()) },
        },
      );
      toast.success((res as any)?.message || "Disbursement retry initiated");
      await refresh();
    } catch (e: any) {
      toast.error(e.data?.message || e.message || "Failed to retry disbursement");
    } finally {
      loading.value.retryingDisbursement = null;
    }
  };

  // Synced scroll for top and bottom scrollbars
  const topScrollRef = ref<HTMLElement | null>(null);
  const mainScrollRef = ref<HTMLElement | null>(null);
  const bottomScrollRef = ref<HTMLElement | null>(null);
  const isSyncing = ref(false);

  const syncScroll = (source: "top" | "main" | "bottom") => {
    if (isSyncing.value) return;
    isSyncing.value = true;
    const scrollLeft =
      source === "top"
        ? topScrollRef.value?.scrollLeft
        : source === "bottom"
          ? bottomScrollRef.value?.scrollLeft
          : mainScrollRef.value?.scrollLeft;

    if (scrollLeft !== undefined) {
      if (source !== "top" && topScrollRef.value) topScrollRef.value.scrollLeft = scrollLeft;
      if (source !== "main" && mainScrollRef.value) mainScrollRef.value.scrollLeft = scrollLeft;
      if (source !== "bottom" && bottomScrollRef.value)
        bottomScrollRef.value.scrollLeft = scrollLeft;
    }
    nextTick(() => {
      isSyncing.value = false;
    });
  };

  // Batch dispatch
  const selectedSubmissions = ref<Set<string>>(new Set());
  const batchDialogOpen = ref(false);
  const batchForm = ref({
    name: "",
    notes: "",
  });

  const { data: batchesData, refresh: refreshBatches } = await useFetch(
    `/api/forms/${route.params.id}/batches`,
    {
      method: "get",
      headers: { ...(await authHeaders()) },
      server: false,
    },
  );

  const batches = computed(() => batchesData.value?.data || []);

  const toggleSelect = (submissionId: string) => {
    if (selectedSubmissions.value.has(submissionId)) {
      selectedSubmissions.value.delete(submissionId);
    } else {
      selectedSubmissions.value.add(submissionId);
    }
    selectedSubmissions.value = new Set(selectedSubmissions.value);
  };

  const toggleSelectAll = () => {
    const productSubmissions = paginatedSubmissions.value.filter(
      (s) => s.storeResponses?.length > 0 && !s.dispatch,
    );
    if (productSubmissions.every((s) => selectedSubmissions.value.has(s.id))) {
      productSubmissions.forEach((s) => selectedSubmissions.value.delete(s.id));
    } else {
      productSubmissions.forEach((s) => selectedSubmissions.value.add(s.id));
    }
    selectedSubmissions.value = new Set(selectedSubmissions.value);
  };

  const allSelected = computed(() => {
    const productSubmissions = paginatedSubmissions.value.filter(
      (s) => s.storeResponses?.length > 0 && !s.dispatch,
    );
    return (
      productSubmissions.length > 0 &&
      productSubmissions.every((s) => selectedSubmissions.value.has(s.id))
    );
  });

  const openBatchDialog = () => {
    batchForm.value = { name: "", notes: "" };
    batchDialogOpen.value = true;
  };

  const createBatch = async () => {
    if (!batchForm.value.name || selectedSubmissions.value.size === 0) {
      toast.error("Please enter a batch name and select submissions");
      return;
    }
    try {
      await $fetch(`/api/forms/${route.params.id}/batches`, {
        method: "POST",
        body: {
          name: batchForm.value.name,
          submissionIds: Array.from(selectedSubmissions.value),
          notes: batchForm.value.notes,
        },
      });
      toast.success("Batch created successfully");
      batchDialogOpen.value = false;
      selectedSubmissions.value = new Set();
      await refreshBatches();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to create batch");
    }
  };

  const batchDispatchDialogOpen = ref(false);
  const batchDispatchForm = ref({
    batchId: "",
    dispatchedBy: "",
    dispatchDate: new Date().toISOString().split("T")[0],
  });

  const openBatchDispatchDialog = (batch: any) => {
    batchDispatchForm.value = {
      batchId: batch.id,
      dispatchedBy: "",
      dispatchDate: new Date().toISOString().split("T")[0],
    };
    batchDispatchDialogOpen.value = true;
  };

  const submitBatchDispatch = async () => {
    if (!batchDispatchForm.value.dispatchedBy || !batchDispatchForm.value.dispatchDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await $fetch(
        `/api/forms/${route.params.id}/batches/${batchDispatchForm.value.batchId}/dispatch`,
        {
          method: "POST",
          body: {
            dispatchedBy: batchDispatchForm.value.dispatchedBy,
            dispatchDate: batchDispatchForm.value.dispatchDate,
          },
        },
      );
      toast.success("Batch dispatched successfully");
      batchDispatchDialogOpen.value = false;
      await refreshBatches();
      await refresh();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to dispatch batch");
    }
  };

  const batchDeliverDialogOpen = ref(false);
  const batchDeliverForm = ref({
    batchId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
  });

  const openBatchDeliverDialog = (batch: any) => {
    batchDeliverForm.value = {
      batchId: batch.id,
      deliveryDate: new Date().toISOString().split("T")[0],
    };
    batchDeliverDialogOpen.value = true;
  };

  const submitBatchDeliver = async () => {
    if (!batchDeliverForm.value.deliveryDate) {
      toast.error("Please set a delivery date");
      return;
    }
    try {
      await $fetch(
        `/api/forms/${route.params.id}/batches/${batchDeliverForm.value.batchId}/deliver`,
        {
          method: "POST",
          body: { deliveryDate: batchDeliverForm.value.deliveryDate },
        },
      );
      toast.success("Batch marked as delivered");
      batchDeliverDialogOpen.value = false;
      await refreshBatches();
      await refresh();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to deliver batch");
    }
  };
</script>

<template>
  <div>
    <main class="container mx-auto max-w-[1440px] px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-foreground text-3xl font-bold">Form Submissions</h1>
            <p class="text-muted-foreground mt-1">Manage and track all your form submissions</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Accepting responses toggle -->
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-sm font-medium">Accepting Responses</span>
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
              <RefreshCw v-else class="h-4 w-4" />
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
              <FileSpreadsheet class="h-4 w-4" />
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
              <RotateCwIcon class="h-4 w-4" />
              <span class="hidden sm:inline">Manage TAT</span>
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <CreditCard class="h-4 w-4" />
              <span class="hidden sm:inline">Credit</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Form Title -->
      <Card class="mb-6 p-6">
        <h2 class="text-foreground text-2xl font-bold">
          {{ form?.title }}
        </h2>
        <p class="text-muted-foreground mt-1">
          {{ formFields.length }} fields • {{ stats.total }} submissions
        </p>
      </Card>

      <!-- Dashboard Stats -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Total Submissions</p>
              <p class="text-2xl font-bold">{{ stats.total }}</p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <FileSpreadsheet class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Completed</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.completed }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Eye class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats.pending }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <Loader class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6" v-if="stats.failedPayment > 0">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Failed Payments</p>
              <p class="text-2xl font-bold text-red-600">
                {{ stats.failedPayment }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <CreditCard class="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Total Revenue</p>
              <p class="text-2xl font-bold">
                {{ formatCurrency(stats.totalRevenue + stats.storeRevenue) }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <CreditCard class="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Pending Dispatch</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats.pendingDispatch }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <Package class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Dispatched</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ stats.dispatched }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Truck class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Delivered</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.delivered }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <PackageCheck class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Tabs -->
      <Card class="mb-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="active">Submissions</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
          </TabsList>
          <TabsContent value="active" class="mt-6">
            <!-- Enhanced Filters Section -->
            <Card class="mb-6 p-6">
              <div class="space-y-6">
                <!-- Filter Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Filter class="text-muted-foreground h-5 w-5" />
                    <h3 class="text-lg font-semibold">Filters</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      v-if="selectedSubmissions.size > 0"
                      size="sm"
                      variant="outline"
                      class="gap-2 border-blue-200 text-blue-600"
                      @click="openBatchDialog"
                    >
                      <Package class="h-4 w-4" />
                      Create Batch ({{ selectedSubmissions.size }})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="filtersVisible = !filtersVisible"
                      class="gap-2"
                    >
                      <ChevronUp v-if="filtersVisible" class="h-4 w-4" />
                      <ChevronDown v-else class="h-4 w-4" />
                      {{ filtersVisible ? "Hide" : "Show" }} Filters
                    </Button>
                    <Button variant="outline" size="sm" @click="clearFilters" class="gap-2">
                      <X class="h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                </div>

                <!-- Filter Controls -->
                <div v-if="filtersVisible" class="space-y-6">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <!-- Search -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Search</Label>
                      <div class="relative">
                        <Search
                          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
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
                          <SelectItem value="failed_payment">Payment Failed</SelectItem>
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

                    <!-- Batch Filter -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Batch</Label>
                      <Select v-model="filters.batchId">
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Batches</SelectItem>
                          <SelectItem value="unbatched">Unbatched</SelectItem>
                          <SelectItem v-for="batch in batches" :key="batch.id" :value="batch.id">
                            {{ batch.name }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Date Range Start -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Start Date</Label>
                      <div class="relative">
                        <Calendar
                          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        />
                        <Input v-model="filters.dateRange.start" type="date" class="pl-10" />
                      </div>
                    </div>

                    <!-- Date Range End -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">End Date</Label>
                      <div class="relative">
                        <Calendar
                          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        />
                        <Input v-model="filters.dateRange.end" type="date" class="pl-10" />
                      </div>
                    </div>
                  </div>

                  <!-- Active Filters Display -->
                  <div
                    v-if="
                      filters.search ||
                      filters.status !== 'all' ||
                      filters.dispatchStatus !== 'all' ||
                      filters.batchId !== 'all' ||
                      filters.dateRange.start ||
                      filters.dateRange.end
                    "
                    class="flex flex-wrap gap-2"
                  >
                    <Badge v-if="filters.search" variant="secondary" class="gap-1">
                      Search: {{ filters.search }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.search = ''" />
                    </Badge>
                    <Badge v-if="filters.status !== 'all'" variant="secondary" class="gap-1">
                      Status: {{ filters.status }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.status = 'all'" />
                    </Badge>
                    <Badge
                      v-if="filters.dispatchStatus !== 'all'"
                      variant="secondary"
                      class="gap-1"
                    >
                      Dispatch: {{ filters.dispatchStatus }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.dispatchStatus = 'all'" />
                    </Badge>
                    <Badge v-if="filters.batchId !== 'all'" variant="secondary" class="gap-1">
                      Batch:
                      {{ batches.find((b) => b.id === filters.batchId)?.name || filters.batchId }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.batchId = 'all'" />
                    </Badge>
                    <Badge v-if="filters.dateRange.start" variant="secondary" class="gap-1">
                      From: {{ filters.dateRange.start }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.dateRange.start = ''" />
                    </Badge>
                    <Badge v-if="filters.dateRange.end" variant="secondary" class="gap-1">
                      To: {{ filters.dateRange.end }}
                      <X class="h-3 w-3 cursor-pointer" @click="filters.dateRange.end = ''" />
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Enhanced Table Section with Dynamic Columns -->
            <Card class="overflow-hidden">
              <!-- Loading State -->
              <div v-if="loading.submissions" class="flex items-center justify-center py-12">
                <Loader class="text-muted-foreground h-8 w-8 animate-spin" />
                <span class="text-muted-foreground ml-2">Loading submissions...</span>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="!submissions?.data?.length"
                class="flex flex-col items-center justify-center py-12"
              >
                <Info class="text-muted-foreground mb-4 h-12 w-12" />
                <p class="text-foreground text-lg font-medium">No submissions found</p>
                <p class="text-muted-foreground text-sm">
                  Submissions will appear here once users submit the form
                </p>
              </div>

              <div v-else class="relative">
                <!-- Top scrollbar -->
                <div ref="topScrollRef" class="overflow-x-auto" @scroll="syncScroll('top')">
                  <div class="h-2 min-w-[1000px]"></div>
                </div>

                <!-- Main table scroll -->
                <div ref="mainScrollRef" class="overflow-x-auto" @scroll="syncScroll('main')">
                  <table class="w-full min-w-[1000px]">
                    <thead class="bg-muted/30 sticky top-0 z-10 border-b">
                      <tr>
                        <th class="w-10 px-2 py-3">
                          <input
                            type="checkbox"
                            :checked="allSelected"
                            @change="toggleSelectAll"
                            class="h-4 w-4 rounded border-gray-300"
                          />
                        </th>
                        <th class="min-w-[120px] px-4 py-3 text-left text-sm font-medium">
                          Submission ID
                        </th>
                        <th class="min-w-[150px] px-4 py-3 text-left text-sm font-medium">
                          Submitter
                        </th>
                        <th class="min-w-[80px] px-4 py-3 text-left text-sm font-medium">Status</th>
                        <!-- Dynamic form field headers -->
                        <th
                          v-for="field in formFields"
                          :key="field.id"
                          class="min-w-[120px] px-4 py-3 text-left text-sm font-medium"
                          :title="field.name"
                        >
                          {{ field.label }}
                        </th>
                        <th class="min-w-[100px] px-4 py-3 text-left text-sm font-medium">
                          Price Paid
                        </th>
                        <th class="min-w-[120px] px-4 py-3 text-left text-sm font-medium">
                          Payment Ref
                        </th>
                        <th class="min-w-[120px] px-4 py-3 text-left text-sm font-medium">
                          Store Items
                        </th>
                        <th class="min-w-[120px] px-4 py-3 text-left text-sm font-medium">
                          Dispatch Status
                        </th>
                        <th class="min-w-[130px] px-4 py-3 text-left text-sm font-medium">
                          Disbursement
                        </th>
                        <th class="min-w-[100px] px-4 py-3 text-left text-sm font-medium">Batch</th>
                        <th class="min-w-[140px] px-4 py-3 text-left text-sm font-medium">
                          Submitted At
                        </th>
                        <th
                          class="bg-muted/30 sticky right-0 min-w-[100px] px-4 py-3 text-right text-sm font-medium shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="submission in paginatedSubmissions"
                        :key="submission.id"
                        class="hover:bg-muted/20 border-b transition-colors"
                      >
                        <td class="px-2 py-4">
                          <input
                            v-if="submission.storeResponses?.length > 0 && !submission.dispatch"
                            type="checkbox"
                            :checked="selectedSubmissions.has(submission.id)"
                            @change="toggleSelect(submission.id)"
                            class="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td class="px-4 py-4">
                          <span class="text-primary text-sm font-medium" :title="submission.id">
                            {{ submission.id.slice(0, 8) }}...
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          <div>
                            <p class="font-medium">
                              {{ submission?.submitter?.name || "N/A" }}
                            </p>
                            <p class="text-muted-foreground text-xs">
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
                              'bg-red-100 text-red-800 hover:bg-red-100': submission.payments
                                ? submission.payments.payment?.status === 'failed'
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
                            {{ formatFieldValue(getFieldValue(submission, field.id), field.type) }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          <span class="font-medium">
                            {{ formatCurrency(submission.pricePaid || 0) }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          <span
                            v-if="submission.payments?.[0]?.payment?.referenceCode"
                            class="font-mono text-sm"
                          >
                            {{ submission.payments[0].payment.referenceCode }}
                          </span>
                          <span v-else class="text-muted-foreground text-sm">-</span>
                        </td>
                        <td class="px-4 py-4">
                          <div v-if="submission.storeResponses?.length > 0" class="space-y-1">
                            <div
                              v-for="item in submission.storeResponses.slice(0, 2)"
                              :key="item.item?.name || 'item'"
                              class="text-sm"
                            >
                              <span class="font-medium">{{ item.item?.name || "Item" }}</span>
                              <span class="text-muted-foreground">
                                ({{ item.quantity || 0 }}x)</span
                              >
                            </div>
                            <span
                              v-if="submission.storeResponses.length > 2"
                              class="text-muted-foreground text-xs"
                            >
                              +{{ submission.storeResponses.length - 2 }} more
                            </span>
                          </div>
                          <span v-else class="text-muted-foreground text-sm">No items</span>
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
                            <span
                              v-if="submission.dispatch?.dispatchedAt"
                              class="text-muted-foreground mt-1 block text-xs"
                            >
                              {{ new Date(submission.dispatch.dispatchedAt).toLocaleDateString() }}
                            </span>
                          </template>
                          <span v-else class="text-muted-foreground text-sm">-</span>
                        </td>
                        <td class="px-4 py-4">
                          <template v-if="getDisbursementBadge(submission)">
                            <Badge
                              variant="outline"
                              :class="getDisbursementBadge(submission).class"
                            >
                              {{ getDisbursementBadge(submission).label }}
                            </Badge>
                            <span
                              v-if="getLatestDisbursement(submission)?.destination"
                              class="text-muted-foreground mt-1 block font-mono text-xs"
                              :title="getLatestDisbursement(submission)?.resultDesc || ''"
                            >
                              {{ getLatestDisbursement(submission)?.destination }}
                            </span>
                          </template>
                          <span v-else class="text-muted-foreground text-sm">-</span>
                        </td>
                        <td class="px-4 py-4 text-sm">
                          <template v-if="submission.dispatch?.batchId">
                            <Badge variant="secondary" class="text-xs">
                              {{
                                batches.find((b) => b.id === submission.dispatch.batchId)?.name ||
                                "Batch"
                              }}
                            </Badge>
                          </template>
                          <span v-else class="text-muted-foreground">-</span>
                        </td>
                        <td class="px-4 py-4">
                          <span class="text-muted-foreground text-sm">
                            {{ formatDate(submission.submittedAt) }}
                          </span>
                        </td>
                        <td
                          class="bg-background sticky right-0 px-4 py-4 text-right shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]"
                        >
                          <div class="flex items-center justify-end gap-2">
                            <NuxtLink
                              :to="`/forms/${form.id}/submissions/${submission.id}`"
                              as-child
                            >
                              <Button size="sm" variant="ghost" class="h-8 w-8 p-0" title="View">
                                <Eye class="h-4 w-4" />
                              </Button>
                            </NuxtLink>

                            <Button
                              v-if="submission.storeResponses?.length > 0 && !submission.dispatch"
                              size="sm"
                              variant="ghost"
                              class="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              title="Dispatch"
                              @click="openDispatchDialog(submission)"
                            >
                              <Truck class="h-4 w-4" />
                            </Button>

                            <Button
                              v-if="submission.dispatch?.status === 'dispatched'"
                              size="sm"
                              variant="ghost"
                              class="h-8 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                              title="Mark Delivered"
                              @click="openDeliverDialog(submission)"
                            >
                              <PackageCheck class="h-4 w-4" />
                            </Button>

                            <Button
                              v-if="canRetryDisbursement(submission)"
                              size="sm"
                              variant="ghost"
                              class="h-8 px-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                              title="Retry Disbursement"
                              :disabled="loading.retryingDisbursement === submission.id"
                              @click="retryDisbursement(submission)"
                            >
                              <Loader
                                v-if="loading.retryingDisbursement === submission.id"
                                class="h-4 w-4 animate-spin"
                              />
                              <Banknote v-else class="h-4 w-4" />
                            </Button>

                            <NuxtLink :to="`/submission/${submission.id}/stop-tat`" as-child>
                              <Button
                                size="sm"
                                variant="ghost"
                                class="h-8 w-8 p-0"
                                title="Stop TAT"
                              >
                                <OctagonMinus class="h-4 w-4" />
                              </Button>
                            </NuxtLink>

                            <Button size="sm" variant="ghost" class="h-8 w-8 p-0" title="Edit">
                              <Edit class="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Bottom scrollbar -->
                <div ref="bottomScrollRef" class="overflow-x-auto" @scroll="syncScroll('bottom')">
                  <div class="h-2 min-w-[1000px]"></div>
                </div>
              </div>

              <!-- Enhanced Pagination -->
              <div
                class="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row"
              >
                <div class="flex items-center gap-4">
                  <p class="text-muted-foreground text-sm">
                    Showing
                    {{ Math.min((currentPage - 1) * itemsPerPage + 1, stats.total) }}
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
                    <span class="ml-1 hidden sm:inline">Previous</span>
                  </Button>

                  <div class="flex items-center gap-1">
                    <Button
                      v-for="page in Math.min(totalPages, 5)"
                      :key="page"
                      :variant="currentPage === page ? 'default' : 'outline'"
                      size="sm"
                      class="h-8 w-8 p-0"
                      @click="currentPage = page"
                    >
                      {{ page }}
                    </Button>
                    <span v-if="totalPages > 5" class="text-muted-foreground px-2">...</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                  >
                    <span class="mr-1 hidden sm:inline">Next</span>
                    <ChevronRight class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="batches" class="mt-6">
            <div v-if="!batches.length" class="flex flex-col items-center justify-center py-12">
              <Package class="text-muted-foreground mb-4 h-12 w-12" />
              <p class="text-foreground text-lg font-medium">No batches yet</p>
              <p class="text-muted-foreground text-sm">
                Select submissions with products and click "Create Batch" to get started
              </p>
            </div>

            <div v-else class="space-y-4">
              <Card v-for="batch in batches" :key="batch.id" class="p-4">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-semibold">{{ batch.name }}</h3>
                      <Badge
                        :variant="batch.status === 'open' ? 'outline' : 'default'"
                        :class="{
                          'border-yellow-300 text-yellow-700': batch.status === 'open',
                          'bg-blue-100 text-blue-800': batch.status === 'dispatched',
                          'bg-green-100 text-green-800': batch.status === 'delivered',
                        }"
                      >
                        {{ batch.status }}
                      </Badge>
                    </div>
                    <p class="text-muted-foreground mt-1 text-sm">
                      {{ batch.dispatches?.length || 0 }} submissions
                    </p>
                    <div v-if="batch.dispatchedBy" class="text-muted-foreground mt-1 text-sm">
                      Dispatched by {{ batch.dispatchedBy }}
                      <span v-if="batch.dispatchedAt">
                        on {{ new Date(batch.dispatchedAt).toLocaleDateString() }}
                      </span>
                    </div>
                    <div v-if="batch.notes" class="text-muted-foreground mt-1 text-sm">
                      Notes: {{ batch.notes }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      v-if="batch.status === 'open'"
                      size="sm"
                      class="gap-2"
                      @click="openBatchDispatchDialog(batch)"
                    >
                      <Truck class="h-4 w-4" />
                      Dispatch All
                    </Button>
                    <Button
                      v-if="batch.status === 'dispatched'"
                      size="sm"
                      class="gap-2 bg-green-600 hover:bg-green-700"
                      @click="openBatchDeliverDialog(batch)"
                    >
                      <PackageCheck class="h-4 w-4" />
                      Mark Delivered
                    </Button>
                  </div>
                </div>

                <!-- Batch items -->
                <div v-if="batch.dispatches?.length" class="mt-4">
                  <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <div
                      v-for="d in batch.dispatches"
                      :key="d.id"
                      class="bg-muted/30 flex items-center justify-between rounded p-2 text-sm"
                    >
                      <div>
                        <p class="font-medium">{{ d.submission?.submitter?.name || "N/A" }}</p>
                        <p class="text-muted-foreground text-xs">
                          {{ d.submission?.storeResponses?.length || 0 }} item(s)
                        </p>
                      </div>
                      <Badge
                        :variant="d.status === 'pending' ? 'outline' : 'default'"
                        :class="{
                          'border-yellow-300 text-yellow-700': d.status === 'pending',
                          'bg-blue-100 text-blue-800': d.status === 'dispatched',
                          'bg-green-100 text-green-800': d.status === 'delivered',
                        }"
                        class="text-xs"
                      >
                        {{ d.status }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <!-- Dispatch Dialog -->
      <AlertDialog v-model:open="dispatchDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <Truck class="h-5 w-5" />
              Dispatch Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set the dispatch details for this submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Dispatched By</Label>
              <Input v-model="dispatchForm.dispatchedBy" placeholder="Name of person dispatching" />
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
              <Loader v-if="loading.dispatching" class="mr-2 h-4 w-4 animate-spin" />
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
              <PackageCheck class="h-5 w-5" />
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
              <Loader v-if="loading.delivering" class="mr-2 h-4 w-4 animate-spin" />
              Mark Delivered
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Create Batch Dialog -->
      <AlertDialog v-model:open="batchDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <Package class="h-5 w-5" />
              Create Dispatch Batch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Group {{ selectedSubmissions.size }} selected submission(s) into a batch for dispatch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Batch Name</Label>
              <Input v-model="batchForm.name" placeholder="e.g. Batch 1 - Jan 2026" />
            </div>
            <div class="space-y-2">
              <Label>Notes (optional)</Label>
              <Input v-model="batchForm.notes" placeholder="Any notes" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="createBatch"> Create Batch </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Batch Dispatch Dialog -->
      <AlertDialog v-model:open="batchDispatchDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <Truck class="h-5 w-5" />
              Dispatch Batch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Mark all submissions in this batch as dispatched. All users will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Dispatched By</Label>
              <Input
                v-model="batchDispatchForm.dispatchedBy"
                placeholder="Name of person dispatching"
              />
            </div>
            <div class="space-y-2">
              <Label>Dispatch Date</Label>
              <Input v-model="batchDispatchForm.dispatchDate" type="date" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitBatchDispatch"> Dispatch All </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Batch Deliver Dialog -->
      <AlertDialog v-model:open="batchDeliverDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <PackageCheck class="h-5 w-5" />
              Deliver Batch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Mark all submissions in this batch as delivered. All users will be notified with a
              confirmation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Delivery Date</Label>
              <Input v-model="batchDeliverForm.deliveryDate" type="date" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitBatchDeliver"> Mark All Delivered </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  </div>
</template>
