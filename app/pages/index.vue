<script lang="ts" setup>
  import {
    Sparkles,
    ArrowRight,
    Lightbulb,
    Target,
    TrendingUp,
    Zap,
    CheckCircle2,
    BarChart3,
    FileCheck,
    Package,
    DollarSign,
    Clock,
    Users,
    Shield,
  } from "lucide-vue-next";

  import { buttonVariants } from "@/components/ui/button";

  useSeoMeta({
    title: "Supply Chain Coordination for Micro & Small Enterprises - Sutit.org",
    description:
      "Sutit.org gives MSEs and cottage producers a clean, enforceable system for coordinating orders, managing delivery commitments, and automating payments - without acting as a marketplace or logistics provider.",
    keywords:
      "supply chain coordination, MSE management, delivery tracking, SLA enforcement, Kenyan businesses, cottage industry, order management",
    author: "Sutit.org",
    robots: "index,follow,max-image-preview:large",
    ogTitle: "Supply Chain Coordination for Micro & Small Enterprises - Sutit.org",
    ogDescription:
      "Sutit.org gives MSEs and cottage producers a clean, enforceable system for coordinating orders, managing delivery commitments, and automating payments.",
    ogImage: "/logo.jpeg",
    ogImageAlt: "Sutit.org - Kenyan Supply Chain Coordination Platform",
    ogUrl: "/",
    ogType: "website",
    ogSiteName: "Sutit.org",
    twitterCard: "summary_large_image",
    twitterSite: "@sutitorg",
    twitterCreator: "@sutitorg",
    twitterTitle: "Supply Chain Coordination for Micro & Small Enterprises - Sutit.org",
    twitterDescription:
      "Sutit.org gives MSEs and cottage producers a clean, enforceable system for coordinating orders, managing delivery commitments, and automating payments.",
    twitterImage: "/logo.jpeg",
    twitterImageAlt: "Sutit.org - Kenyan Supply Chain Coordination Platform",
    themeColor: "#2563eb",
    colorScheme: "light dark",
  });

  // Carousel state
  const currentSlide = ref<number>(0);
  const carouselContainer = ref<HTMLElement | null>(null);
  const windowWidth = ref<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const authStore = useAuthStore();

  const { data: forms } = useFetch("/api/marketplace?limit=6&featured=true", {
    server: false,
  });

  // Calculate slides per view based on screen size
  const slidesPerView = computed<number>(() => {
    if (windowWidth.value < 768) return 1;
    if (windowWidth.value < 1024) return 2;
    return 4;
  });

  const slideWidth = computed<number>(() => 100 / slidesPerView.value);

  const totalSlides = computed<number>(() =>
    Math.ceil((forms.value?.data.length ?? 6) / slidesPerView.value),
  );

  const maxSlide = computed<number>(() => totalSlides.value - 1);

  // Carousel controls
  const nextSlide = (): void => {
    if (currentSlide.value < maxSlide.value) {
      currentSlide.value++;
    }
  };

  const prevSlide = (): void => {
    if (currentSlide.value > 0) {
      currentSlide.value--;
    }
  };

  const goToSlide = (index: number): void => {
    currentSlide.value = index;
  };

  // Handle window resize
  const handleResize = (): void => {
    windowWidth.value = window.innerWidth;
    // Reset to first slide if current slide is out of bounds
    if (currentSlide.value > maxSlide.value) {
      currentSlide.value = maxSlide.value;
    }
  };

  // Auto-play carousel
  let autoplayInterval: NodeJS.Timeout | null = null;

  const startAutoplay = (): void => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }

    autoplayInterval = setInterval(() => {
      if (currentSlide.value >= maxSlide.value) {
        currentSlide.value = 0;
      } else {
        nextSlide();
      }
    }, 5000); // Change slide every 5 seconds
  };

  const stopAutoplay = (): void => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener("resize", handleResize);
    startAutoplay();
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    stopAutoplay();
  });
</script>
<template>
  <div class="bg-background min-h-screen">
    <!-- Hero Section -->
    <section class="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      <div class="relative container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <!-- Badge -->
          <div
            class="bg-primary/10 text-primary hover:bg-primary/20 mb-6 inline-flex cursor-default items-center gap-2 rounded-full px-4 py-2 transition-colors"
          >
            <Sparkles class="h-4 w-4" />
            <span class="text-sm font-medium">ORGANIC KENYAN SOLUTION</span>
          </div>

          <!-- Main Heading -->
          <h1 class="mb-6 text-4xl leading-tight font-bold text-balance md:text-6xl lg:text-7xl">
            Supply Chain Coordination for
            <span class="text-primary">Micro & Small Enterprises</span>
          </h1>

          <!-- Subheading -->
          <p
            class="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg leading-relaxed md:text-xl"
          >
            Sutit.org gives MSEs and cottage producers a clean, enforceable system for coordinating
            orders, managing delivery commitments, and automating payments - without acting as a
            marketplace or logistics provider.
          </p>

          <!-- CTA Buttons -->
          <div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <NuxtLink :to="authStore.isAuthenticated ? `/dashboard` : `/auth/login`" as-child>
              <Button size="lg" class="group">
                Get Started with Sutit
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </NuxtLink>
            <Button size="lg" variant="outline"> How Sutit Works </Button>
          </div>

          <!-- Stats -->
          <div
            class="border-border flex flex-wrap items-center justify-center gap-6 border-t pt-8 md:gap-8"
          >
            <div class="text-center">
              <p class="text-primary mb-1 text-3xl font-bold md:text-4xl">100%</p>
              <p class="text-muted-foreground text-sm">Kenyan MSE Focus</p>
            </div>
            <div class="bg-border hidden h-12 w-px sm:block"></div>
            <div class="text-center">
              <p class="text-primary mb-1 text-3xl font-bold md:text-4xl">0%</p>
              <p class="text-muted-foreground text-sm">Marketplace Fees</p>
            </div>
            <div class="bg-border hidden h-12 w-px sm:block"></div>
            <div class="text-center">
              <p class="text-primary mb-1 text-3xl font-bold md:text-4xl">24/7</p>
              <p class="text-muted-foreground text-sm">SLA Enforcement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- The Problem Section -->
    <section class="bg-muted/30 py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Target class="h-4 w-4" />
              THE REALITY FOR MSEs AND COTTAGE PRODUCERS
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              The Chaos That
              <span class="text-primary">Limits Growth</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <Package class="h-6 w-6 text-red-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">Lost or unclear orders</h3>
              <p class="text-muted-foreground text-sm">
                No structured way to track and confirm customer orders
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10"
              >
                <Clock class="h-6 w-6 text-orange-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">Missed delivery timelines</h3>
              <p class="text-muted-foreground text-sm">
                No system to enforce delivery promises and track performance
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10"
              >
                <DollarSign class="h-6 w-6 text-yellow-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">
                Payment delays and disputes
              </h3>
              <p class="text-muted-foreground text-sm">
                No transparent payment flow or reconciliation system
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10"
              >
                <FileCheck class="h-6 w-6 text-green-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">Zero audit trail</h3>
              <p class="text-muted-foreground text-sm">
                No documented history of transactions and commitments
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10"
              >
                <Zap class="h-6 w-6 text-blue-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">No operational discipline</h3>
              <p class="text-muted-foreground text-sm">
                Informal processes that don't scale or improve
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10"
              >
                <BarChart3 class="h-6 w-6 text-purple-600" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">
                No visibility into performance
              </h3>
              <p class="text-muted-foreground text-sm">
                No metrics or insights to improve business operations
              </p>
            </div>
          </div>

          <div class="mt-12 text-center">
            <p class="text-muted-foreground text-xl italic">
              "This chaos limits growth and keeps small businesses small. The result is
              predictable."
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- The Sutit Solution Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Lightbulb class="h-4 w-4" />
              THE SUTIT SOLUTION
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              Your Supply Chain,
              <span class="text-primary">Disciplined. Digitized. Enforceable.</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-lg">
              Sutit.org transforms the way MSEs run their operations by providing:
            </p>
          </div>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                >
                  <FileCheck class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-foreground mb-2 text-xl font-bold">1. Order Coordination</h3>
                  <p class="text-muted-foreground">
                    Digital order intake and confirmation — simple for customers, structured for
                    suppliers.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                >
                  <Clock class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-foreground mb-2 text-xl font-bold">
                    2. Delivery Timeline Enforcement (SLA)
                  </h3>
                  <p class="text-muted-foreground">
                    Suppliers set their own delivery timelines. Sutit tracks performance and
                    enforces accountability with automated clawbacks.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                >
                  <DollarSign class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-foreground mb-2 text-xl font-bold">
                    3. Payments & Reconciliation
                  </h3>
                  <p class="text-muted-foreground">
                    We handle the payment flow, adjust for SLA compliance, and generate a clean,
                    auditable ledger for both sides.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                >
                  <Package class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-foreground mb-2 text-xl font-bold">
                    4. Workflow Tools Powered by Forms
                  </h3>
                  <p class="text-muted-foreground">
                    Our forms engine supports: order requests, event registrations, service
                    bookings, customer feedback. These tools power MSE operations without defining
                    the product.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Who We Serve Section -->
    <section class="bg-muted/30 py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Users class="h-4 w-4" />
              WHO WE SERVE
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              Purpose-Built for
              <span class="text-primary">MSEs and the Cottage Industry</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-lg">
              Sutit.org is designed for Micro & Small Enterprises - from home-based cottage
              producers to growing local suppliers - who need structure without complexity.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div class="bg-card border-border rounded-xl border p-8">
              <h3 class="text-foreground mb-6 text-2xl font-bold">Core Focus</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p class="mb-1 font-medium">Home-based cottage producers</p>
                    <p class="text-muted-foreground text-sm">
                      Turn your craft into a structured business
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p class="mb-1 font-medium">Growing local suppliers</p>
                    <p class="text-muted-foreground text-sm">
                      Scale operations without losing control
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p class="mb-1 font-medium">Micro & Small Enterprises</p>
                    <p class="text-muted-foreground text-sm">
                      Big business discipline for small businesses
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-card border-border rounded-xl border p-8">
              <h3 class="text-foreground mb-6 text-2xl font-bold">Also Supported</h3>
              <p class="text-muted-foreground mb-4">
                Our platform is flexible enough to support specific non-core clients such as:
              </p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Running clubs</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Community organizations</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Event organizers</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Small initiatives</p>
                </div>
              </div>
              <p class="text-muted-foreground mt-4 text-sm italic">
                These groups use our workflow tools, but MSE supply chains remain the core mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Supplier Ownership Principle Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Shield class="h-4 w-4" />
              OUR PRINCIPLE: SUPPLIER OWNERSHIP FIRST
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              You Own the Relationship.
              <span class="text-primary">We Handle the Coordination.</span>
            </h2>
          </div>

          <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <div class="space-y-4">
              <h3 class="text-foreground mb-4 text-xl font-bold">With Sutit.org:</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="text-primary h-5 w-5 flex-shrink-0" />
                  <p class="text-foreground">You own the customer</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="text-primary h-5 w-5 flex-shrink-0" />
                  <p class="text-foreground">You control pricing</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="text-primary h-5 w-5 flex-shrink-0" />
                  <p class="text-foreground">You manage your logistics</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="text-primary h-5 w-5 flex-shrink-0" />
                  <p class="text-foreground">You choose partners</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="text-primary h-5 w-5 flex-shrink-0" />
                  <p class="text-foreground">You stay in charge</p>
                </div>
              </div>
            </div>

            <div class="bg-card border-border rounded-xl border p-8">
              <div
                class="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              >
                <Target class="text-primary h-8 w-8" />
              </div>
              <p class="text-muted-foreground text-center leading-relaxed">
                Sutit runs the background layer that brings discipline, accountability, and trust to
                every order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How Sutit Works Section -->
    <section class="bg-muted/30 py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Zap class="h-4 w-4" />
              HOW SUTIT WORKS (Process)
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              A Simple 5-Step
              <span class="text-primary">Process</span>
            </h2>
          </div>

          <div class="mx-auto max-w-4xl space-y-8">
            <div class="flex gap-6">
              <div
                class="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold"
              >
                1
              </div>
              <div>
                <h3 class="text-foreground mb-2 text-xl font-bold">Customer Places Order</h3>
                <p class="text-muted-foreground">
                  Through a Sutit link or form, customers submit clean, structured order requests.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold"
              >
                2
              </div>
              <div>
                <h3 class="text-foreground mb-2 text-xl font-bold">
                  Supplier Confirms & Sets Delivery SLA
                </h3>
                <p class="text-muted-foreground">
                  You confirm availability and set the expected delivery time.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold"
              >
                3
              </div>
              <div>
                <h3 class="text-foreground mb-2 text-xl font-bold">Supplier Executes Delivery</h3>
                <p class="text-muted-foreground">
                  Using your own logistics or chosen partners — Sutit does NOT interfere.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold"
              >
                4
              </div>
              <div>
                <h3 class="text-foreground mb-2 text-xl font-bold">
                  SLA Monitoring & Clawback Enforcement
                </h3>
                <p class="text-muted-foreground">
                  If delivery is late, a clawback automatically applies. If on time, settlement
                  proceeds smoothly.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold"
              >
                5
              </div>
              <div>
                <h3 class="text-foreground mb-2 text-xl font-bold">Automated Reconciliation</h3>
                <p class="text-muted-foreground">
                  Every order gets a transparent ledger: who paid, what was delivered, timelines,
                  and final settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why MSEs Grow With Sutit Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <TrendingUp class="h-4 w-4" />
              WHY MSEs GROW WITH SUTIT
            </div>
            <h2 class="mb-4 text-3xl font-bold md:text-5xl">
              A Platform That
              <span class="text-primary">Scales With You</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-lg">
              As MSEs evolve, Sutit evolves:
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Package class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">More Orders</h3>
              <p class="text-muted-foreground text-sm">
                Handle increased volume without losing control or quality
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Users class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">More Partners</h3>
              <p class="text-muted-foreground text-sm">
                Coordinate with multiple suppliers and partners seamlessly
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Zap class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">
                More Operational Complexity
              </h3>
              <p class="text-muted-foreground text-sm">
                Manage sophisticated workflows while maintaining simplicity
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileCheck class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">More Visibility</h3>
              <p class="text-muted-foreground text-sm">
                Gain insights into your operations with comprehensive tracking
              </p>
            </div>

            <div
              class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Shield class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">More Reliability</h3>
              <p class="text-muted-foreground text-sm">
                Build trust with consistent performance and accountability
              </p>
            </div>

            <div
              class="from-primary/10 to-primary/5 border-primary/20 rounded-xl border bg-gradient-to-br p-6"
            >
              <div class="bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <TrendingUp class="text-primary h-6 w-6" />
              </div>
              <h3 class="text-foreground mb-2 text-lg font-semibold">
                Sutit grows through its MSEs
              </h3>
              <p class="text-muted-foreground text-sm">
                Supporting their supply chain maturity, not replacing it
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="relative overflow-hidden py-20">
      <div
        class="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-r to-transparent"
      ></div>
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="bg-primary/5 absolute top-1/2 left-1/4 h-96 w-96 rounded-full blur-3xl"></div>
        <div class="bg-primary/3 absolute top-1/4 right-1/4 h-64 w-64 rounded-full blur-3xl"></div>
      </div>

      <div class="relative container mx-auto px-4">
        <div class="mx-auto max-w-4xl">
          <div
            class="from-card to-card/50 border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-12 text-center shadow-2xl"
          >
            <div
              class="bg-primary/10 absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl"
            ></div>
            <div
              class="bg-primary/10 absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full blur-3xl"
            ></div>

            <div class="relative">
              <h2 class="mb-4 text-3xl font-bold md:text-5xl">
                Bring Discipline to
                <span class="text-primary">Your Supply Chain</span>
              </h2>
              <p class="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
                Sutit.org turns informal workflows into structured, accountable processes — designed
                for the realities of MSEs and the cottage industry.
              </p>
              <div class="flex flex-col justify-center gap-4 sm:flex-row">
                <NuxtLink
                  :to="authStore.isAuthenticated ? `/dashboard` : `/auth/login`"
                  :class="buttonVariants({ size: 'lg' })"
                  class="group"
                >
                  Start Using Sutit
                  <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </NuxtLink>
                <Button size="lg" variant="outline"> Contact Us for Onboarding </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
