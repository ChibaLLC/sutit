<template>
  <div
    class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
  >
    <!-- Shared Navigation -->
    <LayoutAppHeader />

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

          <div class="flex items-center gap-3">
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
              Excel
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <CreditCard class="w-4 h-4" />
              Credit
            </Button>
          </div>
        </div>
      </div>

      <!-- Form Title -->
      <Card class="mb-6 p-6">
        <h2 class="text-2xl font-bold text-foreground">The Test Form Name</h2>
      </Card>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card class="p-4 hover:shadow-lg transition-all duration-200">
          <p class="text-sm font-medium text-muted-foreground mb-2">
            Total Submissions
          </p>
          <p class="text-3xl font-bold text-foreground">2</p>
        </Card>

        <Card class="p-4 hover:shadow-lg transition-all duration-200">
          <p class="text-sm font-medium text-muted-foreground mb-2">Groups</p>
          <p class="text-3xl font-bold text-foreground">15</p>
        </Card>

        <Card class="p-4 hover:shadow-lg transition-all duration-200">
          <p class="text-sm font-medium text-muted-foreground mb-2">
            Completed
          </p>
          <p class="text-3xl font-bold text-foreground">5</p>
        </Card>

        <Card class="p-4 hover:shadow-lg transition-all duration-200">
          <p class="text-sm font-medium text-muted-foreground mb-2">
            Total Revenue
          </p>
          <p class="text-3xl font-bold text-primary">Kes. 469</p>
        </Card>

        <Card class="p-4 hover:shadow-lg transition-all duration-200">
          <p class="text-sm font-medium text-muted-foreground mb-2">
            Total Sales
          </p>
          <p class="text-3xl font-bold text-primary">Kes. 469</p>
        </Card>
      </div>

      <!-- Filters Section -->
      <Card class="mb-6 p-4">
        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
          <!-- Tab Filters -->
          <div class="flex items-center gap-2">
            <Button
              v-for="filter in filters"
              :key="filter.value"
              :variant="activeFilter === filter.value ? 'default' : 'outline'"
              size="sm"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
              <Badge v-if="filter.count" variant="secondary" class="ml-2">
                {{ filter.count }}
              </Badge>
            </Button>
          </div>

          <div class="flex-1"></div>

          <!-- Search Input -->
          <div class="relative max-w-md w-full">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search by field, ID, or group..."
              class="pl-10"
            />
          </div>
        </div>
      </Card>

      <!-- Table Section -->
      <Card class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50 border-b">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-auto p-0 font-medium hover:text-primary"
                  >
                    Submission ID
                    <ChevronDown class="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th class="text-left px-4 py-3 font-medium text-sm">Field 1</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Field 2</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Group</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Payment</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Status</th>
                <th class="text-left px-4 py-3 font-medium text-sm">Store</th>
                <th class="text-left px-4 py-3 font-medium text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-auto p-0 font-medium hover:text-primary"
                  >
                    Date
                    <ChevronDown class="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th class="text-right px-4 py-3 font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in submissions"
                :key="idx"
                class="border-b hover:bg-muted/30 transition-colors"
              >
                <td class="px-4 py-4">
                  <span class="font-medium text-primary">{{ row.id }}</span>
                </td>
                <td class="px-4 py-4">{{ row.field1 }}</td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{
                    row.field2
                  }}</span>
                </td>
                <td class="px-4 py-4">
                  <div v-if="row.group.team">
                    <p class="font-medium">{{ row.group.team }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ row.group.member }}
                    </p>
                  </div>
                  <span v-else>{{ row.group }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm">{{ row.payment }}</span>
                </td>
                <td class="px-4 py-4">
                  <Badge
                    :variant="
                      row.status === 'completed' ? 'success' : 'warning'
                    "
                  >
                    {{ row.status }}
                  </Badge>
                </td>
                <td class="px-4 py-4">{{ row.store }}</td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{
                    row.date
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

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t">
          <p class="text-sm text-muted-foreground">
            Showing <span class="font-medium">1</span> to
            <span class="font-medium">3</span> of{' '}
            <span class="font-medium">3</span> results
          </p>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft class="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
} from "lucide-vue-next";

const acceptingResponses = ref(true);
const searchQuery = ref("");
const activeFilter = ref("all");

const filters = [
  { label: "All", value: "all", count: 3 },
  { label: "Completed", value: "completed", count: 2 },
  { label: "Pending", value: "pending", count: 1 },
];

const submissions = ref([
  {
    id: "SUT-001",
    field1: "Jane Doe",
    field2: "example@email.test",
    group: { team: "Marketing Team", member: "Jane Doe" },
    payment: "Kes 50 via group",
    status: "completed",
    store: "Individual",
    date: "2025-01-15 14:30",
  },
  {
    id: "SUT-002",
    field1: "John Smith",
    field2: "john@email.test",
    group: "Individual",
    payment: "Kes 50",
    status: "completed",
    store: "Store A",
    date: "2025-01-15 14:30",
  },
  {
    id: "SUT-003",
    field1: "Alice Johnson",
    field2: "alice@email.test",
    group: { team: "Marketing Team", member: "Alice Johnson" },
    payment: "Kes 50",
    status: "pending",
    store: "Store B",
    date: "2025-01-15 14:30",
  },
]);
</script>
