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
  ogTitle:
    "Supply Chain Coordination for Micro & Small Enterprises - Sutit.org",
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
  twitterTitle:
    "Supply Chain Coordination for Micro & Small Enterprises - Sutit.org",
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
const windowWidth = ref<number>(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);
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
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section
      class="relative pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
    >
      <div class="container mx-auto px-4 relative">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Badge -->
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 hover:bg-primary/20 transition-colors cursor-default"
          >
            <Sparkles class="w-4 h-4" />
            <span class="text-sm font-medium">ORGANIC KENYAN SOLUTION</span>
          </div>

          <!-- Main Heading -->
          <h1
            class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance"
          >
            Supply Chain Coordination for
            <span class="text-primary">Micro & Small Enterprises</span>
          </h1>

          <!-- Subheading -->
          <p
            class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Sutit.org gives MSEs and cottage producers a clean, enforceable
            system for coordinating orders, managing delivery commitments, and
            automating payments - without acting as a marketplace or logistics
            provider.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <NuxtLink
              :to="authStore.isAuthenticated ? `/dashboard` : `/auth/login`"
              as-child
            >
              <Button size="lg" class="group">
                Get Started with Sutit
                <ArrowRight
                  class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </NuxtLink>
            <Button size="lg" variant="outline"> How Sutit Works </Button>
          </div>

          <!-- Stats -->
          <div
            class="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-8 border-t border-border"
          >
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">
                100%
              </p>
              <p class="text-sm text-muted-foreground">Kenyan MSE Focus</p>
            </div>
            <div class="w-px h-12 bg-border hidden sm:block"></div>
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">0%</p>
              <p class="text-sm text-muted-foreground">Marketplace Fees</p>
            </div>
            <div class="w-px h-12 bg-border hidden sm:block"></div>
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">
                24/7
              </p>
              <p class="text-sm text-muted-foreground">SLA Enforcement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- The Problem Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Target class="w-4 h-4" />
              THE REALITY FOR MSEs AND COTTAGE PRODUCERS
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              The Chaos That
              <span class="text-primary">Limits Growth</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4"
              >
                <Package class="w-6 h-6 text-red-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                Lost or unclear orders
              </h3>
              <p class="text-muted-foreground text-sm">
                No structured way to track and confirm customer orders
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4"
              >
                <Clock class="w-6 h-6 text-orange-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                Missed delivery timelines
              </h3>
              <p class="text-muted-foreground text-sm">
                No system to enforce delivery promises and track performance
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4"
              >
                <DollarSign class="w-6 h-6 text-yellow-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                Payment delays and disputes
              </h3>
              <p class="text-muted-foreground text-sm">
                No transparent payment flow or reconciliation system
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4"
              >
                <FileCheck class="w-6 h-6 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                Zero audit trail
              </h3>
              <p class="text-muted-foreground text-sm">
                No documented history of transactions and commitments
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4"
              >
                <Zap class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                No operational discipline
              </h3>
              <p class="text-muted-foreground text-sm">
                Informal processes that don't scale or improve
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4"
              >
                <BarChart3 class="w-6 h-6 text-purple-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                No visibility into performance
              </h3>
              <p class="text-muted-foreground text-sm">
                No metrics or insights to improve business operations
              </p>
            </div>
          </div>

          <div class="mt-12 text-center">
            <p class="text-xl text-muted-foreground italic">
              "This chaos limits growth and keeps small businesses small. The
              result is predictable."
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- The Sutit Solution Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Lightbulb class="w-4 h-4" />
              THE SUTIT SOLUTION
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              Your Supply Chain,
              <span class="text-primary"
                >Disciplined. Digitized. Enforceable.</span
              >
            </h2>
            <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sutit.org transforms the way MSEs run their operations by
              providing:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                >
                  <FileCheck class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    1. Order Coordination
                  </h3>
                  <p class="text-muted-foreground">
                    Digital order intake and confirmation — simple for
                    customers, structured for suppliers.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                >
                  <Clock class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    2. Delivery Timeline Enforcement (SLA)
                  </h3>
                  <p class="text-muted-foreground">
                    Suppliers set their own delivery timelines. Sutit tracks
                    performance and enforces accountability with automated
                    clawbacks.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                >
                  <DollarSign class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    3. Payments & Reconciliation
                  </h3>
                  <p class="text-muted-foreground">
                    We handle the payment flow, adjust for SLA compliance, and
                    generate a clean, auditable ledger for both sides.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                >
                  <Package class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    4. Workflow Tools Powered by Forms
                  </h3>
                  <p class="text-muted-foreground">
                    Our forms engine supports: order requests, event
                    registrations, service bookings, customer feedback. These
                    tools power MSE operations without defining the product.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Who We Serve Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Users class="w-4 h-4" />
              WHO WE SERVE
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              Purpose-Built for
              <span class="text-primary">MSEs and the Cottage Industry</span>
            </h2>
            <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sutit.org is designed for Micro & Small Enterprises - from
              home-based cottage producers to growing local suppliers - who need
              structure without complexity.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="bg-card border border-border rounded-xl p-8">
              <h3 class="text-2xl font-bold mb-6 text-foreground">
                Core Focus
              </h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <CheckCircle2
                    class="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  />
                  <div>
                    <p class="font-medium mb-1">Home-based cottage producers</p>
                    <p class="text-sm text-muted-foreground">
                      Turn your craft into a structured business
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2
                    class="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  />
                  <div>
                    <p class="font-medium mb-1">Growing local suppliers</p>
                    <p class="text-sm text-muted-foreground">
                      Scale operations without losing control
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2
                    class="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  />
                  <div>
                    <p class="font-medium mb-1">Micro & Small Enterprises</p>
                    <p class="text-sm text-muted-foreground">
                      Big business discipline for small businesses
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-card border border-border rounded-xl p-8">
              <h3 class="text-2xl font-bold mb-6 text-foreground">
                Also Supported
              </h3>
              <p class="text-muted-foreground mb-4">
                Our platform is flexible enough to support specific non-core
                clients such as:
              </p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
                  ></div>
                  <p class="text-muted-foreground">Running clubs</p>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
                  ></div>
                  <p class="text-muted-foreground">Community organizations</p>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
                  ></div>
                  <p class="text-muted-foreground">Event organizers</p>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
                  ></div>
                  <p class="text-muted-foreground">Small initiatives</p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mt-4 italic">
                These groups use our workflow tools, but MSE supply chains
                remain the core mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Supplier Ownership Principle Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Shield class="w-4 h-4" />
              OUR PRINCIPLE: SUPPLIER OWNERSHIP FIRST
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              You Own the Relationship.
              <span class="text-primary">We Handle the Coordination.</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div class="space-y-4">
              <h3 class="text-xl font-bold mb-4 text-foreground">
                With Sutit.org:
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0" />
                  <p class="text-foreground">You own the customer</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0" />
                  <p class="text-foreground">You control pricing</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0" />
                  <p class="text-foreground">You manage your logistics</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0" />
                  <p class="text-foreground">You choose partners</p>
                </div>
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0" />
                  <p class="text-foreground">You stay in charge</p>
                </div>
              </div>
            </div>

            <div class="bg-card border border-border rounded-xl p-8">
              <div
                class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto"
              >
                <Target class="w-8 h-8 text-primary" />
              </div>
              <p class="text-muted-foreground text-center leading-relaxed">
                Sutit runs the background layer that brings discipline,
                accountability, and trust to every order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How Sutit Works Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Zap class="w-4 h-4" />
              HOW SUTIT WORKS (Process)
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              A Simple 5-Step
              <span class="text-primary">Process</span>
            </h2>
          </div>

          <div class="space-y-8 max-w-4xl mx-auto">
            <div class="flex gap-6">
              <div
                class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0"
              >
                1
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">
                  Customer Places Order
                </h3>
                <p class="text-muted-foreground">
                  Through a Sutit link or form, customers submit clean,
                  structured order requests.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0"
              >
                2
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">
                  Supplier Confirms & Sets Delivery SLA
                </h3>
                <p class="text-muted-foreground">
                  You confirm availability and set the expected delivery time.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0"
              >
                3
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">
                  Supplier Executes Delivery
                </h3>
                <p class="text-muted-foreground">
                  Using your own logistics or chosen partners — Sutit does NOT
                  interfere.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0"
              >
                4
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">
                  SLA Monitoring & Clawback Enforcement
                </h3>
                <p class="text-muted-foreground">
                  If delivery is late, a clawback automatically applies. If on
                  time, settlement proceeds smoothly.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0"
              >
                5
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">
                  Automated Reconciliation
                </h3>
                <p class="text-muted-foreground">
                  Every order gets a transparent ledger: who paid, what was
                  delivered, timelines, and final settlement.
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
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <TrendingUp class="w-4 h-4" />
              WHY MSEs GROW WITH SUTIT
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4">
              A Platform That
              <span class="text-primary">Scales With You</span>
            </h2>
            <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
              As MSEs evolve, Sutit evolves:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
              >
                <Package class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                More Orders
              </h3>
              <p class="text-muted-foreground text-sm">
                Handle increased volume without losing control or quality
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
              >
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                More Partners
              </h3>
              <p class="text-muted-foreground text-sm">
                Coordinate with multiple suppliers and partners seamlessly
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
              >
                <Zap class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                More Operational Complexity
              </h3>
              <p class="text-muted-foreground text-sm">
                Manage sophisticated workflows while maintaining simplicity
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
              >
                <FileCheck class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                More Visibility
              </h3>
              <p class="text-muted-foreground text-sm">
                Gain insights into your operations with comprehensive tracking
              </p>
            </div>

            <div
              class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
              >
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
                More Reliability
              </h3>
              <p class="text-muted-foreground text-sm">
                Build trust with consistent performance and accountability
              </p>
            </div>

            <div
              class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6"
            >
              <div
                class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4"
              >
                <TrendingUp class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">
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
    <section class="py-20 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
      ></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl"
        ></div>
      </div>

      <div class="container mx-auto px-4 relative">
        <div class="max-w-4xl mx-auto">
          <div
            class="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl"
            ></div>

            <div class="relative">
              <h2 class="text-3xl md:text-5xl font-bold mb-4">
                Bring Discipline to
                <span class="text-primary">Your Supply Chain</span>
              </h2>
              <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sutit.org turns informal workflows into structured, accountable
                processes — designed for the realities of MSEs and the cottage
                industry.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <NuxtLink
                  :to="authStore.isAuthenticated ? `/dashboard` : `/auth/login`"
                  :class="buttonVariants({ size: 'lg' })"
                  class="group"
                >
                  Start Using Sutit
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </NuxtLink>
                <Button size="lg" variant="outline">
                  Contact Us for Onboarding
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
