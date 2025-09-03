<template>
  <div
    class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
  >
    <!-- Shared Navigation -->
    <LayoutAppHeader />

    <main class="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
      <!-- Header Section -->
      <div class="mb-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1
              class="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Analytics Overview
            </h1>
            <p class="text-sm lg:text-base text-muted-foreground mt-1">
              Track your form performance and user engagement
            </p>
          </div>

          <!-- Date Range Selector -->
          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" class="gap-2">
              <Calendar class="w-4 h-4" />
              <span class="hidden sm:inline">Last 30 days</span>
              <ChevronDown class="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" class="gap-2">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Summary Cards - Mobile Responsive Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <Card
          class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users
                  class="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <Badge variant="outline" class="text-xs">+12%</Badge>
            </div>
            <div class="text-xl lg:text-2xl font-bold text-foreground">
              8,234
            </div>
            <p class="text-xs lg:text-sm text-muted-foreground mt-1">
              Total Users
            </p>
          </div>
        </Card>

        <Card
          class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText
                  class="w-4 h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400"
                />
              </div>
              <Badge variant="outline" class="text-xs">+8%</Badge>
            </div>
            <div class="text-xl lg:text-2xl font-bold text-foreground">156</div>
            <p class="text-xs lg:text-sm text-muted-foreground mt-1">
              Active Forms
            </p>
          </div>
        </Card>

        <Card
          class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp
                  class="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <Badge variant="outline" class="text-xs">+24%</Badge>
            </div>
            <div class="text-xl lg:text-2xl font-bold text-foreground">
              45.2K
            </div>
            <p class="text-xs lg:text-sm text-muted-foreground mt-1">
              Submissions
            </p>
          </div>
        </Card>

        <Card
          class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div class="p-4 lg:p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Target
                  class="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400"
                />
              </div>
              <Badge variant="outline" class="text-xs">+5%</Badge>
            </div>
            <div class="text-xl lg:text-2xl font-bold text-foreground">
              87.3%
            </div>
            <p class="text-xs lg:text-sm text-muted-foreground mt-1">
              Completion Rate
            </p>
          </div>
        </Card>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Submissions Over Time -->
        <Card class="overflow-hidden">
          <div
            class="p-4 lg:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base lg:text-lg font-semibold">
                  Submissions Over Time
                </h3>
                <p class="text-xs lg:text-sm text-muted-foreground mt-1">
                  Daily submissions for the last 30 days
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical class="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <!-- Chart Placeholder -->
            <div
              class="h-48 lg:h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center"
            >
              <BarChart3 class="w-12 h-12 text-primary/30" />
              <span class="ml-2 text-sm text-muted-foreground"
                >Chart Loading...</span
              >
            </div>
          </div>
        </Card>

        <!-- Form Performance -->
        <Card class="overflow-hidden">
          <div
            class="p-4 lg:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base lg:text-lg font-semibold">
                  Form Performance
                </h3>
                <p class="text-xs lg:text-sm text-muted-foreground mt-1">
                  Conversion rates by form
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical class="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div class="p-4 lg:p-6 space-y-4">
            <div v-for="form in topForms" :key="form.name" class="group">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-sm font-medium group-hover:text-primary transition-colors"
                  >{{ form.name }}</span
                >
                <span class="text-sm font-bold text-primary"
                  >{{ form.rate }}%</span
                >
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  :style="`width: ${form.rate}%`"
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Device & Location Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Device Breakdown -->
        <Card class="overflow-hidden">
          <div class="p-4 lg:p-6 border-b bg-muted/30">
            <h3 class="text-base lg:text-lg font-semibold">Device Breakdown</h3>
          </div>
          <div class="p-4 lg:p-6 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Monitor class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm">Desktop</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">62%</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-primary" style="width: 62%"></div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Smartphone class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm">Mobile</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">31%</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-primary" style="width: 31%"></div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Tablet class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm">Tablet</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">7%</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-primary" style="width: 7%"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Top Countries -->
        <Card class="overflow-hidden">
          <div class="p-4 lg:p-6 border-b bg-muted/30">
            <h3 class="text-base lg:text-lg font-semibold">Top Countries</h3>
          </div>
          <div class="p-4 lg:p-6 space-y-3">
            <div
              v-for="country in topCountries"
              :key="country.name"
              class="flex items-center justify-between hover:bg-muted/30 p-2 rounded transition-colors"
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
          <div class="p-4 lg:p-6 border-b bg-muted/30">
            <h3 class="text-base lg:text-lg font-semibold">Quick Stats</h3>
          </div>
          <div class="p-4 lg:p-6 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground"
                >Avg. Session Duration</span
              >
              <span class="text-sm font-bold">4m 23s</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Bounce Rate</span>
              <span class="text-sm font-bold text-green-600">23.4%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground"
                >Pages per Session</span
              >
              <span class="text-sm font-bold">3.2</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground"
                >New vs Returning</span
              >
              <span class="text-sm font-bold">68% / 32%</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Activity - Mobile Optimized -->
      <Card class="overflow-hidden">
        <div class="p-4 lg:p-6 border-b bg-muted/30">
          <div class="flex items-center justify-between">
            <h3 class="text-base lg:text-lg font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden lg:block p-6 space-y-3">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  activity.type === 'submission'
                    ? 'bg-green-500'
                    : 'bg-blue-500',
                ]"
              ></div>
              <div>
                <p class="text-sm font-medium">{{ activity.title }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ activity.description }}
                </p>
              </div>
            </div>
            <span class="text-xs text-muted-foreground">{{
              activity.time
            }}</span>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="lg:hidden p-4 space-y-3">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="p-3 bg-background rounded-lg border"
          >
            <div class="flex items-start gap-3">
              <div
                :class="[
                  'w-2 h-2 rounded-full mt-1.5',
                  activity.type === 'submission'
                    ? 'bg-green-500'
                    : 'bg-blue-500',
                ]"
              ></div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ activity.title }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
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
import { ref } from "vue";
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
