<template>
  <div class="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
    <!-- Shared Navigation -->
    <LayoutAppHeader />

    <main class="container mx-auto max-w-7xl px-4 py-6 lg:py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1
              class="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent lg:text-4xl"
            >
              Analytics Overview
            </h1>
            <p class="text-muted-foreground mt-1 text-sm lg:text-base">
              Track your form performance and user engagement
            </p>
          </div>

          <!-- Date Range Selector -->
          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" class="gap-2">
              <Calendar class="h-4 w-4" />
              <span class="hidden sm:inline">Last 30 days</span>
              <ChevronDown class="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <Download class="h-4 w-4" />
              <span class="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Summary Cards - Mobile Responsive Grid -->
      <div class="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card class="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div class="p-4 lg:p-6">
            <div class="mb-3 flex items-center justify-between">
              <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Users class="h-4 w-4 text-blue-600 lg:h-5 lg:w-5 dark:text-blue-400" />
              </div>
              <Badge variant="outline" class="text-xs">+12%</Badge>
            </div>
            <div class="text-foreground text-xl font-bold lg:text-2xl">8,234</div>
            <p class="text-muted-foreground mt-1 text-xs lg:text-sm">Total Users</p>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div class="p-4 lg:p-6">
            <div class="mb-3 flex items-center justify-between">
              <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <FileText class="h-4 w-4 text-green-600 lg:h-5 lg:w-5 dark:text-green-400" />
              </div>
              <Badge variant="outline" class="text-xs">+8%</Badge>
            </div>
            <div class="text-foreground text-xl font-bold lg:text-2xl">156</div>
            <p class="text-muted-foreground mt-1 text-xs lg:text-sm">Active Forms</p>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div class="p-4 lg:p-6">
            <div class="mb-3 flex items-center justify-between">
              <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <TrendingUp class="h-4 w-4 text-purple-600 lg:h-5 lg:w-5 dark:text-purple-400" />
              </div>
              <Badge variant="outline" class="text-xs">+24%</Badge>
            </div>
            <div class="text-foreground text-xl font-bold lg:text-2xl">45.2K</div>
            <p class="text-muted-foreground mt-1 text-xs lg:text-sm">Submissions</p>
          </div>
        </Card>

        <Card class="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div class="p-4 lg:p-6">
            <div class="mb-3 flex items-center justify-between">
              <div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/20">
                <Target class="h-4 w-4 text-amber-600 lg:h-5 lg:w-5 dark:text-amber-400" />
              </div>
              <Badge variant="outline" class="text-xs">+5%</Badge>
            </div>
            <div class="text-foreground text-xl font-bold lg:text-2xl">87.3%</div>
            <p class="text-muted-foreground mt-1 text-xs lg:text-sm">Completion Rate</p>
          </div>
        </Card>
      </div>

      <!-- Charts Section -->
      <div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Submissions Over Time -->
        <Card class="overflow-hidden">
          <div class="from-primary/5 border-b bg-gradient-to-r to-transparent p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold lg:text-lg">Submissions Over Time</h3>
                <p class="text-muted-foreground mt-1 text-xs lg:text-sm">
                  Daily submissions for the last 30 days
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <!-- Chart Placeholder -->
            <div
              class="from-primary/5 to-primary/10 flex h-48 items-center justify-center rounded-lg bg-gradient-to-br lg:h-64"
            >
              <BarChart3 class="text-primary/30 h-12 w-12" />
              <span class="text-muted-foreground ml-2 text-sm">Chart Loading...</span>
            </div>
          </div>
        </Card>

        <!-- Form Performance -->
        <Card class="overflow-hidden">
          <div class="from-primary/5 border-b bg-gradient-to-r to-transparent p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold lg:text-lg">Form Performance</h3>
                <p class="text-muted-foreground mt-1 text-xs lg:text-sm">
                  Conversion rates by form
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div class="space-y-4 p-4 lg:p-6">
            <div v-for="form in topForms" :key="form.name" class="group">
              <div class="mb-2 flex items-center justify-between">
                <span class="group-hover:text-primary text-sm font-medium transition-colors">{{
                  form.name
                }}</span>
                <span class="text-primary text-sm font-bold">{{ form.rate }}%</span>
              </div>
              <div class="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  class="from-primary to-primary/80 h-full bg-gradient-to-r transition-all duration-500"
                  :style="`width: ${form.rate}%`"
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Device & Location Stats -->
      <div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Device Breakdown -->
        <Card class="overflow-hidden">
          <div class="bg-muted/30 border-b p-4 lg:p-6">
            <h3 class="text-base font-semibold lg:text-lg">Device Breakdown</h3>
          </div>
          <div class="space-y-3 p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Monitor class="text-muted-foreground h-4 w-4" />
                <span class="text-sm">Desktop</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">62%</span>
                <div class="bg-muted h-2 w-20 overflow-hidden rounded-full">
                  <div class="bg-primary h-full" style="width: 62%"></div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Smartphone class="text-muted-foreground h-4 w-4" />
                <span class="text-sm">Mobile</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">31%</span>
                <div class="bg-muted h-2 w-20 overflow-hidden rounded-full">
                  <div class="bg-primary h-full" style="width: 31%"></div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Tablet class="text-muted-foreground h-4 w-4" />
                <span class="text-sm">Tablet</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">7%</span>
                <div class="bg-muted h-2 w-20 overflow-hidden rounded-full">
                  <div class="bg-primary h-full" style="width: 7%"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Top Countries -->
        <Card class="overflow-hidden">
          <div class="bg-muted/30 border-b p-4 lg:p-6">
            <h3 class="text-base font-semibold lg:text-lg">Top Countries</h3>
          </div>
          <div class="space-y-3 p-4 lg:p-6">
            <div
              v-for="country in topCountries"
              :key="country.name"
              class="hover:bg-muted/30 flex items-center justify-between rounded p-2 transition-colors"
            >
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ country.flag }}</span>
                <span class="text-sm font-medium">{{ country.name }}</span>
              </div>
              <Badge variant="secondary">{{ country.users }}</Badge>
            </div>
          </div>
        </Card>

        <!-- Quick Stats -->
        <Card class="overflow-hidden">
          <div class="bg-muted/30 border-b p-4 lg:p-6">
            <h3 class="text-base font-semibold lg:text-lg">Quick Stats</h3>
          </div>
          <div class="space-y-4 p-4 lg:p-6">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Avg. Session Duration</span>
              <span class="text-sm font-bold">4m 23s</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Bounce Rate</span>
              <span class="text-sm font-bold text-green-600">23.4%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Pages per Session</span>
              <span class="text-sm font-bold">3.2</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">New vs Returning</span>
              <span class="text-sm font-bold">68% / 32%</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Activity - Mobile Optimized -->
      <Card class="overflow-hidden">
        <div class="bg-muted/30 border-b p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold lg:text-lg">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden space-y-3 p-6 lg:block">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="hover:bg-muted/30 flex items-center justify-between rounded-lg p-3 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                :class="[
                  'h-2 w-2 rounded-full',
                  activity.type === 'submission' ? 'bg-green-500' : 'bg-blue-500',
                ]"
              ></div>
              <div>
                <p class="text-sm font-medium">{{ activity.title }}</p>
                <p class="text-muted-foreground text-xs">
                  {{ activity.description }}
                </p>
              </div>
            </div>
            <span class="text-muted-foreground text-xs">{{ activity.time }}</span>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="space-y-3 p-4 lg:hidden">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="bg-background rounded-lg border p-3"
          >
            <div class="flex items-start gap-3">
              <div
                :class="[
                  'mt-1.5 h-2 w-2 rounded-full',
                  activity.type === 'submission' ? 'bg-green-500' : 'bg-blue-500',
                ]"
              ></div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ activity.title }}</p>
                <p class="text-muted-foreground text-xs">
                  {{ activity.description }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                  {{ activity.time }}
                </p>
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
    Calendar,
    ChevronDown,
    Download,
    Users,
    FileText,
    TrendingUp,
    Target,
    BarChart3,
    MoreVertical,
    Monitor,
    Smartphone,
    Tablet,
  } from "lucide-vue-next";
  import { ref } from "vue";
  const topForms = ref([
    { name: "Customer Feedback", rate: 92 },
    { name: "Event Registration", rate: 87 },
    { name: "Newsletter Signup", rate: 76 },
    { name: "Product Survey", rate: 65 },
    { name: "Contact Form", rate: 54 },
  ]);

  const topCountries = ref([
    { name: "United States", flag: "🇺🇸", users: "2.3k" },
    { name: "United Kingdom", flag: "🇬🇧", users: "1.8k" },
    { name: "Germany", flag: "🇩🇪", users: "1.2k" },
    { name: "Canada", flag: "🇨🇦", users: "987" },
    { name: "France", flag: "🇫🇷", users: "756" },
  ]);

  const recentActivities = ref([
    {
      id: 1,
      type: "submission",
      title: "New form submission",
      description: "Customer Feedback Form received a new response",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "form",
      title: "Form updated",
      description: "Event Registration form fields were modified",
      time: "15 min ago",
    },
    {
      id: 3,
      type: "submission",
      title: "Bulk submissions",
      description: "23 new responses on Product Survey",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "form",
      title: "Form published",
      description: "Newsletter Signup form is now live",
      time: "3 hours ago",
    },
  ]);
</script>
