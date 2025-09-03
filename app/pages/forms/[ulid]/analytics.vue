<template>
  <div
    class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
  >
    <!-- Shared Navigation -->
    <LayoutAppHeader />

    <main class="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
      <!-- Header Section with Back Button -->
      <div class="mb-6">
        <Button
          variant="outline"
          size="sm"
          class="mb-4 gap-2"
          @click="$router.push('/dashboard')"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-foreground">
              Form Analytics
            </h1>
            <p class="text-sm lg:text-base text-muted-foreground mt-1">
              Detailed insights for your form performance
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" class="gap-2">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <RefreshCcw class="w-4 h-4" />
              <span class="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" class="gap-2">
              <Share2 class="w-4 h-4" />
              <span class="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Form Title Card -->
      <Card class="mb-6 overflow-hidden">
        <div
          class="p-4 lg:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h2 class="text-xl lg:text-2xl font-bold text-foreground">
                Customer Feedback Form
              </h2>
              <div class="flex flex-wrap items-center gap-4 mt-2">
                <Badge variant="success">Active</Badge>
                <span class="text-sm text-muted-foreground"
                  >Created: Jan 15, 2025</span
                >
                <span class="text-sm text-muted-foreground"
                  >ID: FORM-2024-001</span
                >
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-muted-foreground"
                >Accepting Responses</span
              >
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
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card class="group hover:shadow-lg transition-all duration-300">
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs lg:text-sm font-medium text-muted-foreground"
                >Total Views</span
              >
              <Eye
                class="w-4 h-4 text-primary opacity-50 group-hover:opacity-100"
              />
            </div>
            <div class="text-xl lg:text-3xl font-bold text-foreground">
              1,234
            </div>
            <div class="flex items-center mt-1 lg:mt-2">
              <TrendingUp class="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
              <span class="text-xs lg:text-sm text-green-600">+12%</span>
            </div>
          </div>
        </Card>

        <Card class="group hover:shadow-lg transition-all duration-300">
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs lg:text-sm font-medium text-muted-foreground"
                >Submissions</span
              >
              <Send
                class="w-4 h-4 text-primary opacity-50 group-hover:opacity-100"
              />
            </div>
            <div class="text-xl lg:text-3xl font-bold text-foreground">567</div>
            <div class="flex items-center mt-1 lg:mt-2">
              <TrendingUp class="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
              <span class="text-xs lg:text-sm text-green-600">+8%</span>
            </div>
          </div>
        </Card>

        <Card class="group hover:shadow-lg transition-all duration-300">
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs lg:text-sm font-medium text-muted-foreground"
                >Completion Rate</span
              >
              <Target
                class="w-4 h-4 text-primary opacity-50 group-hover:opacity-100"
              />
            </div>
            <div class="text-xl lg:text-3xl font-bold text-foreground">
              45.9%
            </div>
            <div class="flex items-center mt-1 lg:mt-2">
              <TrendingDown class="w-3 h-3 lg:w-4 lg:h-4 text-red-500 mr-1" />
              <span class="text-xs lg:text-sm text-red-600">-2%</span>
            </div>
          </div>
        </Card>

        <Card class="group hover:shadow-lg transition-all duration-300">
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs lg:text-sm font-medium text-muted-foreground"
                >Avg. Time</span
              >
              <Clock
                class="w-4 h-4 text-primary opacity-50 group-hover:opacity-100"
              />
            </div>
            <div class="text-xl lg:text-3xl font-bold text-foreground">
              3:24
            </div>
            <div class="text-xs lg:text-sm text-muted-foreground mt-1 lg:mt-2">
              minutes
            </div>
          </div>
        </Card>
      </div>

      <!-- Charts Section - Responsive Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Submission Trends Chart -->
        <Card class="overflow-hidden">
          <div class="p-4 lg:p-6 border-b bg-muted/30">
            <div class="flex items-center justify-between">
              <h3 class="text-base lg:text-lg font-semibold">
                Submission Trends
              </h3>
              <Button variant="ghost" size="sm">Last 7 days</Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <!-- Chart placeholder - responsive height -->
            <div
              class="h-48 lg:h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center"
            >
              <BarChart3 class="w-12 h-12 text-primary/30" />
            </div>
          </div>
        </Card>

        <!-- Response Breakdown -->
        <Card class="overflow-hidden">
          <div class="p-4 lg:p-6 border-b bg-muted/30">
            <div class="flex items-center justify-between">
              <h3 class="text-base lg:text-lg font-semibold">
                Response Breakdown
              </h3>
              <Button variant="ghost" size="sm">Details</Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">Completed</span>
                  <span class="text-sm font-bold text-green-600"
                    >567 (45.9%)</span
                  >
                </div>
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style="width: 45.9%"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">Partial</span>
                  <span class="text-sm font-bold text-amber-600"
                    >312 (25.3%)</span
                  >
                </div>
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: 25.3%"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">Abandoned</span>
                  <span class="text-sm font-bold text-red-600"
                    >355 (28.8%)</span
                  >
                </div>
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-red-500" style="width: 28.8%"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Submissions Table - Mobile Optimized -->
      <Card class="overflow-hidden">
        <div class="p-4 lg:p-6 border-b bg-muted/30">
          <div class="flex items-center justify-between">
            <h3 class="text-base lg:text-lg font-semibold">
              Recent Submissions
            </h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50 border-b">
              <tr>
                <th class="text-left px-6 py-3 text-sm font-medium">ID</th>
                <th class="text-left px-6 py-3 text-sm font-medium">Name</th>
                <th class="text-left px-6 py-3 text-sm font-medium">Email</th>
                <th class="text-left px-6 py-3 text-sm font-medium">Status</th>
                <th class="text-left px-6 py-3 text-sm font-medium">Date</th>
                <th class="text-right px-6 py-3 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="i in 5"
                :key="i"
                class="border-b hover:bg-muted/30 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-medium text-primary">
                  #00{{ i }}
                </td>
                <td class="px-6 py-4 text-sm">John Doe</td>
                <td class="px-6 py-4 text-sm text-muted-foreground">
                  john@example.com
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="i % 2 === 0 ? 'success' : 'warning'">
                    {{ i % 2 === 0 ? "Completed" : "Partial" }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">
                  Jan 15, 2025
                </td>
                <td class="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden p-4 space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="p-4 bg-background rounded-lg border hover:border-primary/20 transition-all"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-medium text-sm">#00{{ i }} - John Doe</p>
                <p class="text-xs text-muted-foreground">john@example.com</p>
              </div>
              <Badge
                :variant="i % 2 === 0 ? 'success' : 'warning'"
                class="text-xs"
              >
                {{ i % 2 === 0 ? "Completed" : "Partial" }}
              </Badge>
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-muted-foreground">Jan 15, 2025</span>
              <Button variant="ghost" size="sm" class="h-7 text-xs"
                >View</Button
              >
            </div>
          </div>
        </div>
      </Card>

      <!-- Field Performance - Mobile Responsive -->
      <Card class="mt-6 overflow-hidden">
        <div class="p-4 lg:p-6 border-b bg-muted/30">
          <h3 class="text-base lg:text-lg font-semibold">Field Performance</h3>
        </div>
        <div class="p-4 lg:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="field in [
                'Name',
                'Email',
                'Phone',
                'Message',
                'Rating',
                'Subscribe',
              ]"
              :key="field"
              class="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">{{ field }} Field</span>
                <span class="text-xs text-muted-foreground">95% filled</span>
              </div>
              <div class="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary"
                  :style="`width: ${95 - Math.random() * 20}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
const acceptingResponses = ref(true);
</script>
