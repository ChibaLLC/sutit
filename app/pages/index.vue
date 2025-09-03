<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
    <!-- Shared Navigation -->
    <LayoutAppHeader />

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
            <Button size="lg" class="group">
              Get Started Free
              <ArrowRight
                class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Button size="lg" variant="outline">
              <PlayCircle class="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div class="flex items-center justify-center gap-8 mt-12">
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground">10K+</p>
              <p class="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground">500K+</p>
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
              collection needs. Start your free trial today, no credit card
              required.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" class="group">
                Start Free Trial
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Button>
              <Button size="lg" variant="outline"> Schedule Demo </Button>
            </div>
            <p class="text-sm text-muted-foreground mt-6">
              ✓ 14-day free trial &nbsp;&nbsp; ✓ No credit card required
              &nbsp;&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </Card>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-muted/30 border-t">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
              >
                <span class="text-white font-bold">S</span>
              </div>
              <span class="text-lg font-bold">SUTIT Forms</span>
            </div>
            <p class="text-sm text-muted-foreground">
              The most powerful form builder for modern teams.
            </p>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Product</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Features</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Pricing</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Templates</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Integrations</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >About</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Blog</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Careers</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Contact</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Legal</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Privacy</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Terms</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Security</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >GDPR</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground"
        >
          <p>&copy; 2025 SUTIT Forms. All rights reserved.</p>
        </div>
      </div>
    </footer>
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
</script>
