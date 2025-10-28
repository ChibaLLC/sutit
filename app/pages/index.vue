<script lang="ts" setup>
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  CheckCircle2,
  Database,
  ShoppingCart,
  Receipt,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Package,
  DollarSign,
  Truck,
} from "lucide-vue-next";
import { buttonVariants } from "@/components/ui/button";

useSeoMeta({
  title: "Create Powerful Forms in Minutes - SUTIT",
  description:
    "We offer exactly what you're in need of from a form-based tool for different kinds of industries, including Accounting, consulting, sales, delivery, and many more. It's limitless.",
  keywords:
    "form builder, online forms, data collection, survey tool, registration forms, SUTIT",
  author: "SUTIT",
  robots: "index,follow,max-image-preview:large",
  ogTitle: "Create Powerful Forms in Minutes - SUTIT",
  ogDescription:
    "We offer exactly what you're in need of from a form-based tool for different kinds of industries, including Accounting, consulting, sales, delivery, and many more. It's limitless.",
  ogImage: "/logo.jpeg",
  ogImageAlt: "SUTIT Forms - Create Powerful Forms in Minutes",
  ogUrl: "/",
  ogType: "website",
  ogSiteName: "SUTIT",
  twitterCard: "summary_large_image",
  twitterSite: "@sutit",
  twitterCreator: "@sutit",
  twitterTitle: "Create Powerful Forms in Minutes - SUTIT",
  twitterDescription:
    "We offer exactly what you're in need of from a form-based tool for different kinds of industries, including Accounting, consulting, sales, delivery, and many more. It's limitless.",
  twitterImage: "/logo.jpeg",
  twitterImageAlt: "SUTIT Forms - Create Powerful Forms in Minutes",
  themeColor: "#2563eb",
  colorScheme: "light dark",
});

// Carousel state
const currentSlide = ref<number>(0);
const carouselContainer = ref<HTMLElement | null>(null);
const windowWidth = ref<number>(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);

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
            <span class="text-sm font-medium"
              >Your Success Story Starts With Us</span
            >
          </div>

          <!-- Main Heading -->
          <h1
            class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance"
          >
            <span class="text-primary">Enterprise</span>
            <br />
            <span>Supply Chain Solutions</span>
          </h1>

          <!-- Subheading -->
          <p
            class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            End-to-end efficiency for your entire supply chain. Automate
            Marketing/Sales, Purchase/Orders, Payments till Receipt/Order
            Fulfillment.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" class="group">
              Get Started
              <ArrowRight
                class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button size="lg" variant="outline">
              <PlayCircle class="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          <!-- Stats -->
          <div
            class="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-8 border-t border-border"
          >
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">
                1K+
              </p>
              <p class="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div class="w-px h-12 bg-border hidden sm:block"></div>
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">
                1K+
              </p>
              <p class="text-sm text-muted-foreground">Forms Created</p>
            </div>
            <div class="w-px h-12 bg-border hidden sm:block"></div>
            <div class="text-center">
              <p class="text-3xl md:text-4xl font-bold text-primary mb-1">
                99.9%
              </p>
              <p class="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="features" class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">Featured Forms</h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular form templates designed to streamline your
            workflow
          </p>
        </div>

        <!-- Carousel Container -->
        <div class="relative max-w-7xl mx-auto">
          <!-- Carousel -->
          <div class="overflow-hidden" ref="carouselContainer">
            <div
              class="flex transition-transform duration-500 ease-out"
              :style="{
                transform: `translateX(-${currentSlide * slideWidth}%)`,
              }"
            >
              <div
                v-for="(form, index) in forms?.data"
                :key="index"
                class="shrink-0 px-3"
                :style="{ width: slideWidth + '%' }"
              >
                <div
                  class="group bg-card border border-border rounded-xl p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden h-full"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  ></div>
                  <div class="relative flex flex-col h-full">
                    <div
                      class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors"
                    >
                      <component
                        :is="FileCheck"
                        class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
                      />
                    </div>
                    <h3
                      class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors"
                    >
                      {{ form.title }}
                    </h3>
                    <p class="text-sm text-muted-foreground mb-4 grow">
                      {{ form.description }}
                    </p>
                    <NuxtLink
                      :to="`/forms/${form.slug}`"
                      :class="buttonVariants({})"
                    >
                      View Form
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <button
            @click="prevSlide"
            :disabled="currentSlide === 0"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border disabled:hover:text-foreground z-10"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button
            @click="nextSlide"
            :disabled="currentSlide >= maxSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border disabled:hover:text-foreground z-10"
          >
            <ChevronRight class="w-6 h-6" />
          </button>

          <!-- Dots Indicator -->
          <div class="flex justify-center gap-2 mt-8">
            <button
              v-for="(dot, index) in totalSlides"
              :key="index"
              @click="goToSlide(index)"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="
                currentSlide === index
                  ? 'bg-primary w-8'
                  : 'bg-border hover:bg-primary/50'
              "
            ></button>
          </div>
        </div>

        <!-- View More Button -->
        <div class="text-center mt-12">
          <NuxtLink
            href="/marketplace"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            Explore Public Forms
            <ArrowRight
              class="w-4 h-4 group-hover:translate-x-1 transition-transform"
            />
          </NuxtLink>
        </div>
      </div>
    </section>
    <!-- Supply Chain Features Section -->
    <section class="py-16 md:py-20 lg:py-24 bg-muted/50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12 md:mb-16">
          <h2
            class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance"
          >
            Complete Supply Chain Automation
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline every step of your supply chain with integrated solutions
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          <!-- Marketing/Sales Card -->
          <Card
            class="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <CardContent class="pt-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <ShoppingCart
                  class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>
              <h3 class="text-lg font-semibold mb-2">Marketing/Sales</h3>
              <p class="text-sm text-muted-foreground">
                Automate lead generation and sales workflows
              </p>
            </CardContent>
          </Card>

          <!-- Purchase/Orders Card -->
          <Card
            class="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <CardContent class="pt-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <Package
                  class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>
              <h3 class="text-lg font-semibold mb-2">Purchase/Orders</h3>
              <p class="text-sm text-muted-foreground">
                Manage orders and procurement seamlessly
              </p>
            </CardContent>
          </Card>

          <!-- Payments Card -->
          <Card
            class="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <CardContent class="pt-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <DollarSign
                  class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>
              <h3 class="text-lg font-semibold mb-2">Payments</h3>
              <p class="text-sm text-muted-foreground">
                Secure payment processing and tracking
              </p>
            </CardContent>
          </Card>

          <!-- Receipt/Fulfillment Card -->
          <Card
            class="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <CardContent class="pt-6">
              <div
                class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <Truck
                  class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>
              <h3 class="text-lg font-semibold mb-2">Receipt/Fulfillment</h3>
              <p class="text-sm text-muted-foreground">
                Track deliveries and order fulfillment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    <!-- Feature Forms Section -->

    <!-- About Section -->
    <section id="about" class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">About Us</h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn why SUTIT Forms is the perfect solution for your data
            collection needs
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
        >
          <div class="text-center group">
            <div
              class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
            >
              <Lightbulb
                class="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">How It Started</h3>
            <p class="text-muted-foreground">
              We have the solution for collecting data and info in the most
              efficient way. Our system uses an API which is stable, flexible
              and easy to use.
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
            >
              <Target
                class="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">How It's Going</h3>
            <p class="text-muted-foreground">
              We are trusted by companies and students all around the world. Our
              platform keeps growing and we are always improving with every
              update.
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
            >
              <TrendingUp
                class="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">The Value</h3>
            <p class="text-muted-foreground">
              Transform your data collection with flexible forms. Analyze and
              export all you need to make your business run smoothly and stay
              ahead of your competitors.
            </p>
          </div>
        </div>

        <!-- Pressure Section -->
        <div
          class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center"
        >
          <div class="order-2 lg:order-1">
            <div
              class="bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-shadow"
            >
              <div
                class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
              >
                <Zap class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-2xl font-bold mb-4">
                Working with us is a pleasure
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                We are here to come up with ideas and turn them to actionable
                code in no time. Our staff are always ready to give you the help
                you need and provide the end result you wish for. We are 24/7
                and we assure you that we are reliable at all times as you can
                contact us whether you are from China or Nairobi and you'll get
                instant feedback.
              </p>
            </div>
          </div>

          <div class="order-1 lg:order-2">
            <div
              class="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-12 text-primary-foreground relative overflow-hidden group hover:shadow-2xl transition-all"
            >
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 group-hover:scale-150 transition-transform duration-700"
              ></div>
              <div class="relative">
                <h3 class="text-3xl font-bold mb-4">No Need for Checks</h3>
                <p class="text-primary-foreground/90 mb-6 leading-relaxed">
                  You don't need to triple check to see if everything is running
                  well. You can trust us to manage and maintain a website that's
                  up 99% of the time. Compare us to others and we believe you'll
                  come back.
                </p>
                <ul class="space-y-3">
                  <li class="flex items-center gap-3">
                    <CheckCircle2 class="w-5 h-5 shrink-0" />
                    <span>100% secure and encrypted</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <CheckCircle2 class="w-5 h-5 shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <CheckCircle2 class="w-5 h-5 shrink-0" />
                    <span>Fast and reliable servers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">
            What can you do at SUTIT?
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            From simple data collection to advanced analytics, our platform
            empowers you to do more
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            class="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors"
            >
              <Database
                class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">Email Data Collection</h3>
            <p class="text-muted-foreground">
              Gather and manage email addresses efficiently. Create subscription
              forms or newsletter sign-ups that automatically store emails in
              your database for easy access and future campaigns.
            </p>
          </div>

          <div
            class="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors"
            >
              <ShoppingCart
                class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">
              Purchase Order Fulfillment
            </h3>
            <p class="text-muted-foreground">
              Upload a file and it confirms payment via the form and delivery.
              An alternative marketplace allows clients to sell and others to
              buy and we integrate right in. We monitor every item sold or any
              query on a given item.
            </p>
          </div>

          <div
            class="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors"
            >
              <Receipt
                class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">Trouble & Receipts</h3>
            <p class="text-muted-foreground">
              Easily track payment issues and bill clients with customizable
              templates. These document requests can be replied to online as
              well and you give them a chance to clarify or request reversal of
              a bill or service.
            </p>
          </div>

          <div
            class="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors"
            >
              <BarChart3
                class="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h3 class="text-xl font-semibold mb-3">Analytics & Reporting</h3>
            <p class="text-muted-foreground">
              Visualize all the data from forms with automatic integration to
              pie, bar, or line charts. Filter as required, use AI suggestions
              to optimize your forms and display data in a way that's easy for
              you to understand.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Growing Company Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <div
              class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 hover:bg-primary hover:scale-110 transition-all duration-300 group"
            >
              <TrendingUp
                class="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              A growing company
            </h2>
            <p class="text-lg text-muted-foreground mb-8">
              We are constantly working on our capabilities and innovation
            </p>
          </div>

          <div class="space-y-4">
            <div
              class="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group"
            >
              <div
                class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 class="w-5 h-5 text-primary-foreground" />
              </div>
              <p
                class="text-muted-foreground group-hover:text-foreground transition-colors"
              >
                We truly believe in being part of your success
              </p>
            </div>

            <div
              class="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group"
            >
              <div
                class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 class="w-5 h-5 text-primary-foreground" />
              </div>
              <p
                class="text-muted-foreground group-hover:text-foreground transition-colors"
              >
                You're bright red to not go too deep
              </p>
            </div>

            <div
              class="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group"
            >
              <div
                class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 class="w-5 h-5 text-primary-foreground" />
              </div>
              <p
                class="text-muted-foreground group-hover:text-foreground transition-colors"
              >
                Let's see what else one of the very few can do
              </p>
            </div>

            <div
              class="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group"
            >
              <div
                class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 class="w-5 h-5 text-primary-foreground" />
              </div>
              <p
                class="text-muted-foreground group-hover:text-foreground transition-colors"
              >
                You're bright but not excessive demonstration
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Build Something Section -->
    <section class="py-20 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
      ></div>
      <div class="container mx-auto px-4 relative">
        <div class="max-w-4xl mx-auto text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">Build Something</h2>
          <p class="text-lg text-muted-foreground mb-8">
            Engage and attract your audience with fast, easy, and powerful forms
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
        >
          <div
            class="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:shadow-lg transition-shadow group"
          >
            <CheckCircle2
              class="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform"
            />
            <div>
              <h3 class="font-semibold mb-2">Dedicated For the User</h3>
              <p class="text-sm text-muted-foreground">
                We don't ask you to go through many checks or verifications. Our
                system was created having in mind that simplicity is key.
                Everything runs seamlessly.
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:shadow-lg transition-shadow group"
          >
            <CheckCircle2
              class="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform"
            />
            <div>
              <h3 class="font-semibold mb-2">Free(most of) to Use</h3>
              <p class="text-sm text-muted-foreground">
                Unlike others, we don't hide feature behind a paywall. We
                believe in accessibility so we are giving a large percentage of
                features for free to everyone.
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:shadow-lg transition-shadow group"
          >
            <CheckCircle2
              class="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform"
            />
            <div>
              <h3 class="font-semibold mb-2">Feedback & Requests</h3>
              <p class="text-sm text-muted-foreground">
                If you have any ideas on what can be added or improved you can
                always leave a suggestion through our feedback form and we'll
                make sure that it reaches the development team.
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-4 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:shadow-lg transition-shadow group"
          >
            <CheckCircle2
              class="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform"
            />
            <div>
              <h3 class="font-semibold mb-2">Created For Students</h3>
              <p class="text-sm text-muted-foreground">
                As a student ourselves, we know the struggle and so we are also
                passionate about helping scholars stay organized and manage
                their assignments effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20">
      <div class="container mx-auto px-4">
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
                Ready to build your first form?
              </h2>
              <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                With SUTIT Forms, you gain the power to create, manage, and
                analyze forms that drive results. Get started in seconds.
              </p>
              <NuxtLink
                href="/auth/register"
                :class="buttonVariants({ size: 'lg' })"
              >
                Get Started Free
              </NuxtLink>
              <p class="text-sm text-muted-foreground mt-6">
                ✓ No credit card required • ✓ Free forever plan available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
