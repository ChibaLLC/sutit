<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  Users,
  DollarSign,
  ArrowRight,
  Zap,
  Activity,
} from "lucide-vue-next";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/stores/auth";

const activitiesData = ref(null);
const formsData = ref(null);
const statsData = ref(null);

const authStore = useAuthStore();

onMounted(async () => {
  try {
    const [activitiesRes, formsRes, statsRes] = await Promise.all([
      fetch("/api/activities"),
      fetch("/api/forms?limit=5"),
      fetch("/api/dashboard"),
    ]);

    activitiesData.value = await activitiesRes.json();
    formsData.value = await formsRes.json();
    statsData.value = await statsRes.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
});

const quickActions = [
  {
    name: "Create New Form",
    description: "Start building a new form",
    href: "/forms/new",
    icon: Plus,
  },
  {
    name: "Manage Forms",
    description: "View and edit your forms",
    href: "/forms",
    icon: Settings,
  },
];

const dashboardCards = computed(() => {
  if (!statsData.value) return [];

  return [
    {
      name: "Total Forms",
      count: statsData.value?.forms?.total || 0,
      icon: FileText,
      description: "Forms you've created",
      trend: 12,
    },
    {
      name: "Responses",
      count: statsData.value?.forms?.submissionsReceived || 0,
      icon: Activity,
      description: "Responses received",
      trend: 8,
    },
    {
      name: "Submissions",
      count: statsData.value?.submissions?.made || 0,
      icon: Zap,
      description: "Forms you've submitted",
      trend: -3,
    },
    {
      name: "Completion Rate",
      count:
        statsData.value?.forms?.submissionsReceived > 0
          ? Math.round(
              (statsData.value?.submissions?.made /
                statsData.value?.forms?.submissionsReceived) *
                100,
            )
          : 0,
      icon: Activity,
      description: "Average completion %",
      trend: 5,
    },
    {
      name: "Groups",
      count: statsData.value?.groups?.created || 0,
      icon: Users,
      description: "Groups you've created",
      trend: 15,
    },
    {
      name: "Revenue",
      count: statsData.value?.payments?.revenue || 0,
      icon: DollarSign,
      description: "Total revenue received",
      trend: 22,
    },
  ];
});

// Utility functions for formatting
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-background via-background to-muted/30"
  >
    <main class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Welcome Section -->
      <div class="mb-12">
        <div class="space-y-2">
          <h1 class="text-5xl font-bold text-foreground">
            Welcome back,
            <span
              class="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              >{{ authStore.user?.name }}</span
            >!
          </h1>
          <p class="text-lg text-muted-foreground">
            Track your forms, submissions, and growth in real-time
          </p>
        </div>
      </div>

      <!-- Enhanced stats grid with better visual hierarchy and animations -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div
          v-for="(card, index) in dashboardCards"
          :key="card.name"
          class="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <!-- Gradient background on hover -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          <div class="relative p-6 space-y-4">
            <div class="flex items-start justify-between">
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">
                  {{ card.name }}
                </p>
                <p class="text-3xl font-bold text-foreground">
                  {{ formatNumber(card.count) }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
              >
                <component :is="card.icon" class="w-6 h-6 text-primary" />
              </div>
            </div>

            <!-- Added trend indicator for better insights -->
            <div v-if="card.trend" class="flex items-center gap-2 text-sm">
              <component
                :is="card.trend > 0 ? TrendingUp : TrendingDown"
                class="w-4 h-4"
                :class="card.trend > 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span :class="card.trend > 0 ? 'text-green-600' : 'text-red-600'">
                {{ Math.abs(card.trend) }}% from last month
              </span>
            </div>

            <p v-if="card.description" class="text-xs text-muted-foreground">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions with enhanced styling -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.href"
            :to="action.href"
            class="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <!-- Added animated gradient background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />

            <div class="relative flex items-center gap-4">
              <div
                class="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
              >
                <component :is="action.icon" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3
                  class="font-semibold text-foreground group-hover:text-primary transition-colors"
                >
                  {{ action.name }}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {{ action.description }}
                </p>
              </div>
              <ArrowRight
                class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto"
              />
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Forms and Events -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Forms -->
        <div
          class="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div
            class="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-foreground">Recent Forms</h2>
              <NuxtLink
                to="/forms"
                class="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All →
              </NuxtLink>
            </div>
          </div>
          <div class="p-6 space-y-3">
            <NuxtLink
              v-for="form in formsData?.data"
              :key="form.id"
              :to="`/forms/${form.id}`"
              class="group flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText class="w-4 h-4 text-primary" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                    class="font-medium text-foreground truncate group-hover:text-primary transition-colors"
                  >
                    {{ form.title }}
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(form.createdAt) }}
                  </p>
                </div>
              </div>
              <Badge variant="outline" class="flex-shrink-0 ml-2">{{
                form.status
              }}</Badge>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Events -->
        <div
          class="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div
            class="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div
              v-for="activity in activitiesData?.data"
              :key="activity.id"
              class="flex items-start gap-4 group"
            >
              <!-- Improved activity timeline indicator -->
              <div class="relative flex flex-col items-center">
                <div
                  class="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/20"
                />
                <div
                  class="w-0.5 h-12 bg-gradient-to-b from-primary/30 to-transparent"
                />
              </div>
              <div class="flex-1 pt-0.5">
                <p class="text-sm text-foreground">
                  <span class="font-semibold text-primary">{{
                    activity.type
                  }}</span>
                  <span class="text-muted-foreground">
                    {{ activity.description }}</span
                  >
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ formatDate(activity.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div[style*="animation-delay"] {
  animation: slideIn 0.6s ease-out forwards;
}
</style>
