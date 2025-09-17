<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"
      ></div>
      <div class="container mx-auto px-4 py-20 lg:py-32">
        <div class="max-w-4xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Sparkles class="w-4 h-4" />
            <span class="text-sm font-medium">Introducing SUTIT Forms 2.0</span>
          </div>

          <h1
            class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6"
          >
            Create Powerful Forms in Minutes
          </h1>

          <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build, share, and analyze beautiful forms with our intuitive
            drag-and-drop builder. Collect data efficiently and make informed
            decisions.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              :class="buttonVariants({ size: 'lg' })"
              to="/auth/register"
              class="group"
            >
              Get Started Free
              <ArrowRight
                class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
            <Button size="lg" variant="outline">
              <PlayCircle class="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div class="flex items-center justify-center gap-8 mt-12">
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground">1K+</p>
              <p class="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground">1K+</p>
              <p class="text-sm text-muted-foreground">Forms Created</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground">99.9%</p>
              <p class="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Build Better Forms
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you create, manage, and analyze
            forms effortlessly
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <Palette class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Drag & Drop Builder
              </h3>
              <p class="text-muted-foreground">
                Create beautiful forms with our intuitive visual builder. No
                coding required.
              </p>
            </div>
          </Card>

          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Secure & Compliant
              </h3>
              <p class="text-muted-foreground">
                Enterprise-grade security with GDPR compliance and data
                encryption.
              </p>
            </div>
          </Card>

          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <ChartBar class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Advanced Analytics
              </h3>
              <p class="text-muted-foreground">
                Get detailed insights with real-time analytics and custom
                reports.
              </p>
            </div>
          </Card>

          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Team Collaboration
              </h3>
              <p class="text-muted-foreground">
                Work together with your team with shared forms and permissions.
              </p>
            </div>
          </Card>

          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <Zap class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Lightning Fast
              </h3>
              <p class="text-muted-foreground">
                Optimized for speed with instant form loading and submission
                processing.
              </p>
            </div>
          </Card>

          <Card
            class="group hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div class="p-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <Globe class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Multi-language
              </h3>
              <p class="text-muted-foreground">
                Create forms in multiple languages to reach a global audience.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
      ></div>
      <div class="container mx-auto px-4 relative">
        <Card
          class="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
        >
          <div class="p-12 text-center">
            <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Data Collection?
            </h2>
            <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams who trust SUTIT Forms for their data
              collection needs. Start for free today.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink
                :class="buttonVariants({ size: 'lg' })"
                :to="`/auth/register`"
                class="group"
              >
                Start For Free
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </NuxtLink>
              <Button size="lg" variant="outline"> Schedule Demo </Button>
            </div>
            <p class="text-sm text-muted-foreground mt-6">
              ✓ Start for free today
            </p>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  PlayCircle,
  Sparkles,
  Palette,
  Shield,
  ChartBar,
  Users,
  Zap,
  Globe,
} from "lucide-vue-next";
import { buttonVariants } from "~/components/ui/button";
</script>
