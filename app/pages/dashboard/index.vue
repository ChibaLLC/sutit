<script setup lang="ts">
import type { VariantProps } from "class-variance-authority";
import {
  FileText,
  Eye,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Plus,
  Settings,
  Download,
} from "lucide-vue-next";
import type { Component } from "vue";
import { buttonVariants } from "~/components/ui/button";
type QuickActions = {
  name: string;
  href: string;
  icon: Component;
  variant: string;
};

type DashboardCard = {
  name: string;
  count: number;
  icon: Component;
  description?: string;
};
const dashboardCards: DashboardCard[] = [
  {
    name: "Total Forms",
    count: 10,
    icon: FileText,
    description: "",
  },
  {
    name: "Total Responses",
    count: 10,
    icon: Eye,
    description: "",
  },
  {
    name: "Active Forms",
    count: 10,
    icon: Zap,
    description: "",
  },
  {
    name: "Completion Rate",
    count: 10,
    icon: Activity,
    description: "",
  },
];

const quickActions: QuickActions[] = [
  {
    name: "Create New Form",
    href: "/forms/new",
    icon: Plus,
    variant: "default",
  },
  {
    name: "Manage Forms",
    href: "/forms",
    icon: Settings,
    variant: "outline",
  },
];
</script>
<template>
  <div>
    <main class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Welcome Section with gradient background -->
      <div class="mb-8 relative">
        <div
          class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl"
        ></div>
        <div class="relative">
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2"
          >
            Welcome back, Admin!
          </h1>
          <p class="text-lg text-muted-foreground">
            Here's what's happening with your forms today.
          </p>
        </div>
      </div>

      <!-- Stats Grid with enhanced styling -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card
          v-for="card in dashboardCards"
          :key="card.name"
          class="group hover:shadow-lg hover:border-primary/20 transition-all duration-300"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-muted-foreground">{{
                card.name
              }}</span>
              <div
                class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors"
              >
                <component :is="card.icon" class="w-5 h-5 text-primary" />
              </div>
            </div>
            <div class="text-3xl font-bold text-foreground">
              {{ card.count }}
            </div>
            <div class="flex items-center mt-2 text-sm" v-if="card.description">
              <TrendingUp class="w-4 h-4 text-green-500 mr-1" />
              <span class="text-muted-foreground ml-1">{{
                card.description
              }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Quick Actions with better styling -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NuxtLink
            v-for="action in quickActions"
            :id="action.href"
            :to="action.href"
            :class="
              buttonVariants({
                variant: action.variant,
                class: 'h-auto py-6 group',
              })
            "
          >
            <div class="flex flex-col items-center gap-2">
              <div
                class="p-2 rounded-lg bg-primary-foreground/10 group-hover:bg-primary-foreground/20 transition-colors"
              >
                <component :is="action.icon" class="w-6 h-6" />
              </div>
              <span class="font-medium">{{ action.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Forms and Events with enhanced cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Forms -->
        <Card class="overflow-hidden">
          <div class="p-6 border-b border-border bg-muted/30">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-foreground">
                Recent Forms
              </h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div
              class="group flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <div class="p-2 bg-primary/10 rounded-lg">
                  <FileText class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3
                    class="font-medium text-foreground group-hover:text-primary transition-colors"
                  >
                    Customer Feedback Survey
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    Created 2 hours ago
                  </p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div
              class="group flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <div class="p-2 bg-primary/10 rounded-lg">
                  <FileText class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3
                    class="font-medium text-foreground group-hover:text-primary transition-colors"
                  >
                    Event Registration Form
                  </h3>
                  <p class="text-sm text-muted-foreground">Created 1 day ago</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div
              class="group flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <div class="p-2 bg-muted/50 rounded-lg">
                  <FileText class="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h3
                    class="font-medium text-foreground group-hover:text-primary transition-colors"
                  >
                    Product Survey
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    Created 3 days ago
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
          </div>
        </Card>

        <!-- Recent Events -->
        <Card class="overflow-hidden">
          <div class="p-6 border-b border-border bg-muted/30">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-foreground">
                Recent Events
              </h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-start gap-4 group">
              <div class="relative mt-1">
                <div
                  class="w-2 h-2 bg-primary rounded-full animate-pulse"
                ></div>
                <div
                  class="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping"
                ></div>
              </div>
              <div class="flex-1">
                <p class="text-sm text-foreground">
                  New response received for
                  <span class="font-medium text-primary"
                    >Customer Feedback Survey</span
                  >
                </p>
                <p class="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
            </div>

            <div class="flex items-start gap-4 group">
              <div class="w-2 h-2 bg-primary/60 rounded-full mt-1"></div>
              <div class="flex-1">
                <p class="text-sm text-foreground">
                  Form
                  <span class="font-medium text-primary"
                    >Event Registration</span
                  >
                  reached 100 responses
                </p>
                <p class="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div class="flex items-start gap-4 group">
              <div class="w-2 h-2 bg-primary/40 rounded-full mt-1"></div>
              <div class="flex-1">
                <p class="text-sm text-foreground">
                  New form
                  <span class="font-medium text-primary">Product Survey</span>
                  created
                </p>
                <p class="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>

            <div class="flex items-start gap-4 group">
              <div class="w-2 h-2 bg-primary/40 rounded-full mt-1"></div>
              <div class="flex-1">
                <p class="text-sm text-foreground">
                  Form
                  <span class="font-medium text-primary"
                    >Newsletter Signup</span
                  >
                  updated
                </p>
                <p class="text-xs text-muted-foreground">4 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>
