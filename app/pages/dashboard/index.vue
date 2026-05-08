<script setup lang="ts">
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
    Loader2,
    Layers,
  } from "lucide-vue-next";
  import { computed } from "vue";

  import { Badge } from "~/components/ui/badge";
  import { Button } from "~/components/ui/button";
  import { useAuthStore } from "~/stores/auth";

  const authStore = useAuthStore();

  // Use useFetch for parallel data fetching with loading states
  const { data: activitiesData, pending: activitiesPending } = useFetch("/api/activities");
  const { data: formsData, pending: formsPending } = useFetch("/api/forms?limit=5");
  const { data: statsData, pending: statsPending } = useFetch("/api/dashboard");

  // Combined loading state
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
    {
      name: "Manage My Groups",
      description: "View groups you've created or joined",
      href: "/groups",
      icon: Layers,
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
                (statsData.value?.submissions?.made / statsData.value?.forms?.submissionsReceived) *
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
  <div class="from-background via-background to-muted/30 min-h-screen bg-gradient-to-br">
    <main class="container mx-auto max-w-7xl px-4 py-8">
      <!-- Welcome Section -->
      <div class="mb-12">
        <div class="space-y-2">
          <h1 class="text-foreground text-5xl font-bold">
            Welcome back,
            <span class="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">{{
              authStore.user?.name
            }}</span
            >!
          </h1>
          <p class="text-muted-foreground text-lg">
            Track your forms, submissions, and growth in real-time
          </p>
        </div>
      </div>

      <!-- Enhanced stats grid with loaders -->
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Loading skeleton for stats -->
        <template v-if="statsPending">
          <div
            v-for="i in 6"
            :key="i"
            class="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur-sm"
          >
            <div class="mb-4 flex items-start justify-between">
              <div class="flex-1 space-y-2">
                <div class="bg-muted/50 h-4 w-24 animate-pulse rounded" />
                <div class="bg-muted/50 h-8 w-16 animate-pulse rounded" />
              </div>
              <div class="bg-muted/50 h-12 w-12 animate-pulse rounded-lg" />
            </div>
            <div class="bg-muted/50 h-3 w-32 animate-pulse rounded" />
          </div>
        </template>

        <!-- Actual stats cards -->
        <template v-else>
          <NuxtLink
            v-for="(card, index) in dashboardCards"
            :key="card.name"
            :to="card.name === 'Groups' ? '/groups' : undefined"
            class="group border-border/50 bg-card/50 hover:border-primary/30 relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
            :class="{ 'cursor-pointer': card.name === 'Groups' }"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <div
              class="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div class="relative space-y-4 p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <p class="text-muted-foreground text-sm font-medium">
                    {{ card.name }}
                  </p>
                  <p class="text-foreground text-3xl font-bold">
                    {{ formatNumber(card.count) }}
                  </p>
                </div>
                <div
                  class="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-3 transition-colors"
                >
                  <component :is="card.icon" class="text-primary h-6 w-6" />
                </div>
              </div>

              <div v-if="card.trend" class="flex items-center gap-2 text-sm">
                <component
                  :is="card.trend > 0 ? TrendingUp : TrendingDown"
                  class="h-4 w-4"
                  :class="card.trend > 0 ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="card.trend > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ Math.abs(card.trend) }}% from last month
                </span>
              </div>

              <p v-if="card.description" class="text-muted-foreground text-xs">
                {{ card.description }}
              </p>
            </div>
          </NuxtLink>
        </template>
      </div>

      <!-- Quick Actions -->
      <div class="mb-12">
        <h2 class="text-foreground mb-6 text-2xl font-bold">Quick Actions</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.href"
            :to="action.href"
            class="group border-border/50 bg-card/50 hover:border-primary/30 relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
          >
            <div
              class="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div class="relative flex items-center gap-4">
              <div class="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-4 transition-colors">
                <component :is="action.icon" class="text-primary h-6 w-6" />
              </div>
              <div>
                <h3
                  class="text-foreground group-hover:text-primary font-semibold transition-colors"
                >
                  {{ action.name }}
                </h3>
                <p class="text-muted-foreground text-sm">
                  {{ action.description }}
                </p>
              </div>
              <ArrowRight
                class="text-muted-foreground group-hover:text-primary ml-auto h-5 w-5 transition-all group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Forms and Events -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Recent Forms -->
        <div class="border-border/50 bg-card/50 overflow-hidden rounded-xl border backdrop-blur-sm">
          <div class="border-border/50 from-primary/5 border-b bg-gradient-to-r to-transparent p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-foreground text-xl font-bold">Recent Forms</h2>
              <NuxtLink
                to="/forms"
                class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                View All →
              </NuxtLink>
            </div>
          </div>
          <div class="space-y-3 p-6">
            <!-- Loading state for forms -->
            <template v-if="formsPending">
              <div
                v-for="i in 3"
                :key="i"
                class="border-border/30 bg-background/50 flex items-center gap-3 rounded-lg border p-4"
              >
                <div class="bg-muted/50 h-10 w-10 animate-pulse rounded-lg" />
                <div class="flex-1 space-y-2">
                  <div class="bg-muted/50 h-4 w-3/4 animate-pulse rounded" />
                  <div class="bg-muted/50 h-3 w-1/4 animate-pulse rounded" />
                </div>
              </div>
            </template>

            <!-- Forms list -->
            <template v-else-if="formsData?.data?.length">
              <NuxtLink
                v-for="form in formsData.data"
                :key="form.id"
                :to="`/forms/${form.id}`"
                class="group border-border/30 bg-background/50 hover:border-primary/30 hover:bg-primary/5 flex items-center justify-between rounded-lg border p-4 transition-all duration-300"
              >
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <div class="bg-primary/10 flex-shrink-0 rounded-lg p-2">
                    <FileText class="text-primary h-4 w-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3
                      class="text-foreground group-hover:text-primary truncate font-medium transition-colors"
                    >
                      {{ form.title }}
                    </h3>
                    <p class="text-muted-foreground text-xs">
                      {{ formatDate(form.createdAt) }}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" class="ml-2 flex-shrink-0">{{ form.status }}</Badge>
              </NuxtLink>
            </template>

            <!-- Empty state -->
            <div v-else class="text-muted-foreground py-8 text-center">
              <FileText class="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No forms yet</p>
            </div>
          </div>
        </div>

        <!-- Recent Events -->
        <div class="border-border/50 bg-card/50 overflow-hidden rounded-xl border backdrop-blur-sm">
          <div class="border-border/50 from-primary/5 border-b bg-gradient-to-r to-transparent p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-foreground text-xl font-bold">Recent Activity</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </div>
          <div class="space-y-4 p-6">
            <!-- Loading state for activities -->
            <template v-if="activitiesPending">
              <div v-for="i in 4" :key="i" class="flex items-start gap-4">
                <div class="bg-muted/50 mt-1 h-3 w-3 animate-pulse rounded-full" />
                <div class="flex-1 space-y-2">
                  <div class="bg-muted/50 h-4 w-full animate-pulse rounded" />
                  <div class="bg-muted/50 h-3 w-1/4 animate-pulse rounded" />
                </div>
              </div>
            </template>

            <!-- Activities list -->
            <template v-else-if="activitiesData?.data?.length">
              <div
                v-for="activity in activitiesData.data"
                :key="activity.id"
                class="group flex items-start gap-4"
              >
                <div class="relative flex flex-col items-center">
                  <div class="bg-primary ring-primary/20 h-3 w-3 rounded-full ring-2" />
                  <div class="from-primary/30 h-12 w-0.5 bg-gradient-to-b to-transparent" />
                </div>
                <div class="flex-1 pt-0.5">
                  <p class="text-foreground text-sm">
                    <span class="text-primary font-semibold">{{ activity.type }}</span>
                    <span class="text-muted-foreground"> {{ activity.description }}</span>
                  </p>
                  <p class="text-muted-foreground mt-1 text-xs">
                    {{ formatDate(activity.createdAt) }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Empty state -->
            <div v-else class="text-muted-foreground py-8 text-center">
              <Activity class="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No recent activity</p>
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
