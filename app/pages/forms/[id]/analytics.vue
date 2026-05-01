<template>
  <div class="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
    <!-- Shared Navigation -->
    <LayoutAppHeader />

    <main class="container mx-auto max-w-7xl px-4 py-6 lg:py-8">
      <!-- Header Section with Back Button -->
      <div class="mb-6">
        <Button variant="outline" size="sm" class="mb-4 gap-2" @click="$router.push('/dashboard')">
          <ArrowLeft class="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-foreground text-2xl font-bold lg:text-3xl">Form Analytics</h1>
            <p class="text-muted-foreground mt-1 text-sm lg:text-base">
              Detailed insights for your form performance
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" class="gap-2">
              <Download class="h-4 w-4" />
              <span class="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <RefreshCcw class="h-4 w-4" />
              <span class="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" class="gap-2">
              <Share2 class="h-4 w-4" />
              <span class="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Form Title Card -->
      <Card class="mb-6 overflow-hidden">
        <div class="from-primary/10 via-primary/5 bg-gradient-to-r to-transparent p-4 lg:p-6">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 class="text-foreground text-xl font-bold lg:text-2xl">Customer Feedback Form</h2>
              <div class="mt-2 flex flex-wrap items-center gap-4">
                <Badge variant="success">Active</Badge>
                <span class="text-muted-foreground text-sm">Created: Jan 15, 2025</span>
                <span class="text-muted-foreground text-sm">ID: FORM-2024-001</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-sm font-medium">Accepting Responses</span>
              <button
                @click="acceptingResponses = !acceptingResponses"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
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
          </div>
        </div>
      </Card>

      <!-- Key Metrics Grid - Responsive -->
      <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card class="group transition-all duration-300 hover:shadow-lg">
          <div class="p-4 lg:p-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-muted-foreground text-xs font-medium lg:text-sm">Total Views</span>
              <Eye class="text-primary h-4 w-4 opacity-50 group-hover:opacity-100" />
            </div>
            <div class="text-foreground text-xl font-bold lg:text-3xl">1,234</div>
            <div class="mt-1 flex items-center lg:mt-2">
              <TrendingUp class="mr-1 h-3 w-3 text-green-500 lg:h-4 lg:w-4" />
              <span class="text-xs text-green-600 lg:text-sm">+12%</span>
            </div>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:shadow-lg">
          <div class="p-4 lg:p-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-muted-foreground text-xs font-medium lg:text-sm">Submissions</span>
              <Send class="text-primary h-4 w-4 opacity-50 group-hover:opacity-100" />
            </div>
            <div class="text-foreground text-xl font-bold lg:text-3xl">567</div>
            <div class="mt-1 flex items-center lg:mt-2">
              <TrendingUp class="mr-1 h-3 w-3 text-green-500 lg:h-4 lg:w-4" />
              <span class="text-xs text-green-600 lg:text-sm">+8%</span>
            </div>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:shadow-lg">
          <div class="p-4 lg:p-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-muted-foreground text-xs font-medium lg:text-sm"
                >Completion Rate</span
              >
              <Target class="text-primary h-4 w-4 opacity-50 group-hover:opacity-100" />
            </div>
            <div class="text-foreground text-xl font-bold lg:text-3xl">45.9%</div>
            <div class="mt-1 flex items-center lg:mt-2">
              <TrendingDown class="mr-1 h-3 w-3 text-red-500 lg:h-4 lg:w-4" />
              <span class="text-xs text-red-600 lg:text-sm">-2%</span>
            </div>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:shadow-lg">
          <div class="p-4 lg:p-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-muted-foreground text-xs font-medium lg:text-sm">Avg. Time</span>
              <Clock class="text-primary h-4 w-4 opacity-50 group-hover:opacity-100" />
            </div>
            <div class="text-foreground text-xl font-bold lg:text-3xl">3:24</div>
            <div class="text-muted-foreground mt-1 text-xs lg:mt-2 lg:text-sm">minutes</div>
          </div>
        </Card>
      </div>

      <!-- Charts Section - Responsive Grid -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Submission Trends Chart -->
        <Card class="overflow-hidden">
          <div class="bg-muted/30 border-b p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold lg:text-lg">Submission Trends</h3>
              <Button variant="ghost" size="sm">Last 7 days</Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <!-- Chart placeholder - responsive height -->
            <div
              class="from-primary/5 to-primary/10 flex h-48 items-center justify-center rounded-lg bg-gradient-to-br lg:h-64"
            >
              <BarChart3 class="text-primary/30 h-12 w-12" />
            </div>
          </div>
        </Card>

        <!-- Response Breakdown -->
        <Card class="overflow-hidden">
          <div class="bg-muted/30 border-b p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold lg:text-lg">Response Breakdown</h3>
              <Button variant="ghost" size="sm">Details</Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <div class="space-y-4">
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">Completed</span>
                  <span class="text-sm font-bold text-green-600">567 (45.9%)</span>
                </div>
                <div class="bg-muted h-2 overflow-hidden rounded-full">
                  <div class="h-full bg-green-500" style="width: 45.9%"></div>
                </div>
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">Partial</span>
                  <span class="text-sm font-bold text-amber-600">312 (25.3%)</span>
                </div>
                <div class="bg-muted h-2 overflow-hidden rounded-full">
                  <div class="h-full bg-amber-500" style="width: 25.3%"></div>
                </div>
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">Abandoned</span>
                  <span class="text-sm font-bold text-red-600">355 (28.8%)</span>
                </div>
                <div class="bg-muted h-2 overflow-hidden rounded-full">
                  <div class="h-full bg-red-500" style="width: 28.8%"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Submissions Table - Mobile Optimized -->
      <Card class="overflow-hidden">
        <div class="bg-muted/30 border-b p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold lg:text-lg">Recent Submissions</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full">
            <thead class="bg-muted/50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-medium">ID</th>
                <th class="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th class="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th class="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th class="px-6 py-3 text-left text-sm font-medium">Date</th>
                <th class="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i" class="hover:bg-muted/30 border-b transition-colors">
                <td class="text-primary px-6 py-4 text-sm font-medium">#00{{ i }}</td>
                <td class="px-6 py-4 text-sm">John Doe</td>
                <td class="text-muted-foreground px-6 py-4 text-sm">john@example.com</td>
                <td class="px-6 py-4">
                  <Badge :variant="i % 2 === 0 ? 'success' : 'warning'">
                    {{ i % 2 === 0 ? "Completed" : "Partial" }}
                  </Badge>
                </td>
                <td class="text-muted-foreground px-6 py-4 text-sm">Jan 15, 2025</td>
                <td class="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="space-y-3 p-4 lg:hidden">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-background hover:border-primary/20 rounded-lg border p-4 transition-all"
          >
            <div class="mb-2 flex items-start justify-between">
              <div>
                <p class="text-sm font-medium">#00{{ i }} - John Doe</p>
                <p class="text-muted-foreground text-xs">john@example.com</p>
              </div>
              <Badge :variant="i % 2 === 0 ? 'success' : 'warning'" class="text-xs">
                {{ i % 2 === 0 ? "Completed" : "Partial" }}
              </Badge>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-muted-foreground text-xs">Jan 15, 2025</span>
              <Button variant="ghost" size="sm" class="h-7 text-xs">View</Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Field Performance - Mobile Responsive -->
      <Card class="mt-6 overflow-hidden">
        <div class="bg-muted/30 border-b p-4 lg:p-6">
          <h3 class="text-base font-semibold lg:text-lg">Field Performance</h3>
        </div>
        <div class="p-4 lg:p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="field in ['Name', 'Email', 'Phone', 'Message', 'Rating', 'Subscribe']"
              :key="field"
              class="bg-muted/30 hover:bg-muted/50 rounded-lg p-4 transition-colors"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">{{ field }} Field</span>
                <span class="text-muted-foreground text-xs">95% filled</span>
              </div>
              <div class="bg-background h-1.5 overflow-hidden rounded-full">
                <div class="bg-primary h-full" :style="`width: ${95 - Math.random() * 20}%`"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
  import {
    ArrowLeft,
    Download,
    RefreshCcw,
    Share2,
    Eye,
    Send,
    Target,
    Clock,
    TrendingUp,
    TrendingDown,
    BarChart3,
  } from "lucide-vue-next";
  import { ref } from "vue";
  const acceptingResponses = ref(true);
</script>
