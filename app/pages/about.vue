<script setup lang="ts">
  import {
    ArrowRight,
    Target,
    Heart,
    Lightbulb,
    Shield,
    Users,
    Users2,
    Zap,
    Globe,
    User,
    Rocket,
    Github,
    Linkedin,
    Twitter,
    Plus,
    Coffee,
    MapPin,
    Banknote,
    GraduationCap,
    Calendar,
    Laptop,
    CheckCircle2,
    Truck,
    Package,
    DollarSign,
    Clock,
    FileCheck,
    TrendingUp,
  } from "lucide-vue-next";

  useSeoMeta({
    title: "About Sutit.org - Organic Kenyan Supply Chain Coordination Platform",
    description:
      "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry. We provide digital backbone, SLA tracking, and delivery-promise enforcement.",
    keywords:
      "Kenyan supply chain, MSE coordination, cottage industry, delivery tracking, SLA enforcement, digital backbone",
    author: "Sutit.org",
    robots: "index,follow,max-image-preview:large",
    ogTitle: "About Sutit.org - Organic Kenyan Supply Chain Coordination Platform",
    ogDescription:
      "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry.",
    ogImage: "/logo.jpeg",
    ogImageAlt: "Sutit.org - Kenyan Supply Chain Platform",
    ogUrl: "/about",
    ogType: "website",
    ogSiteName: "Sutit.org",
    twitterCard: "summary_large_image",
    twitterSite: "@sutitorg",
    twitterCreator: "@sutitorg",
    twitterTitle: "About Sutit.org - Organic Kenyan Supply Chain Coordination Platform",
    twitterDescription:
      "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry.",
    twitterImage: "/logo.jpeg",
    twitterImageAlt: "Sutit.org - Kenyan Supply Chain Platform",
    themeColor: "#2563eb",
    colorScheme: "light dark",
  });
</script>
<template>
  <div>
    <!-- Hero Section -->
    <section class="from-primary/5 via-background to-background bg-gradient-to-br py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <div
            class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
          >
            <Globe class="h-4 w-4" />
            <span class="text-sm font-medium">ORGANIC KENYAN SOLUTION</span>
          </div>

          <h1 class="mb-6 text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">
            <span class="text-primary">Sutit.org</span>
            <br />
            Supply Chain Coordination Platform
          </h1>

          <p
            class="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg leading-relaxed md:text-xl"
          >
            Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro &
            Small Enterprises and the Cottage Industry. We're designed from the ground up around how
            Kenyan businesses actually operate - irregular logistics, cash-based transactions, tight
            delivery promises, and customers who expect instant accountability.
          </p>

          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" class="group">
              Get Started with Sutit
              <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline"> How Sutit Works </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Value Proposition -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2
                class="text-foreground mb-6 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
              >
                Real Control for
                <span class="text-primary">Kenyan MSEs</span>
              </h2>

              <div class="text-muted-foreground space-y-6 text-lg leading-relaxed">
                <p>
                  Sutit gives MSE suppliers real control: your orders, your timelines, your
                  logistics, your customer relationships.
                </p>
                <p>
                  We provide the digital backbone, SLA tracking, delivery-promise enforcement, and
                  reconciliation, so small businesses can run with big-business discipline.
                </p>
                <p>
                  MSEs are our core. But whenever a bigger client faces the same coordination chaos,
                  our engine scales to them too.
                </p>
                <p>
                  As Kenyan MSEs grow, Sutit grows with them, strengthening their partners and
                  tightening their entire supply chain ecosystem.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div class="mb-3 flex items-center gap-3">
                  <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Package class="text-primary h-5 w-5" />
                  </div>
                  <h3 class="font-semibold">Your Orders</h3>
                </div>
                <p class="text-muted-foreground text-sm">
                  Complete control over order management and customer relationships
                </p>
              </div>

              <div
                class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div class="mb-3 flex items-center gap-3">
                  <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Clock class="text-primary h-5 w-5" />
                  </div>
                  <h3 class="font-semibold">Your Timelines</h3>
                </div>
                <p class="text-muted-foreground text-sm">
                  Set and enforce delivery promises with automated SLA tracking
                </p>
              </div>

              <div
                class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div class="mb-3 flex items-center gap-3">
                  <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Truck class="text-primary h-5 w-5" />
                  </div>
                  <h3 class="font-semibold">Your Logistics</h3>
                </div>
                <p class="text-muted-foreground text-sm">
                  Manage delivery your way with full operational control
                </p>
              </div>

              <div
                class="bg-card border-border rounded-xl border p-6 transition-shadow hover:shadow-lg"
              >
                <div class="mb-3 flex items-center gap-3">
                  <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Users class="text-primary h-5 w-5" />
                  </div>
                  <h3 class="font-semibold">Your Relationships</h3>
                </div>
                <p class="text-muted-foreground text-sm">
                  Maintain direct customer ownership while we handle coordination
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Features Section -->
    <section class="bg-muted/30 py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Target class="h-4 w-4" />
              THE SUTIT SOLUTION
            </div>
            <h2
              class="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              Your Supply Chain,
              <span class="text-primary">Disciplined. Digitized. Enforceable.</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
              Sutit.org transforms the way MSEs run their operations by providing:
            </p>
          </div>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                >
                  <FileCheck class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-foreground mb-2 text-xl font-bold">1. Order Coordination</h3>
                  <p class="text-muted-foreground leading-relaxed">
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
                  <p class="text-muted-foreground leading-relaxed">
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
                  <p class="text-muted-foreground leading-relaxed">
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
                  <p class="text-muted-foreground leading-relaxed">
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
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Users class="h-4 w-4" />
              WHO WE SERVE
            </div>
            <h2
              class="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              Purpose-Built for
              <span class="text-primary">MSEs and the Cottage Industry</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
              Sutit.org is designed for Micro & Small Enterprises - from home-based cottage
              producers to growing local suppliers - who need structure without complexity.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
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

            <div>
              <h3 class="text-foreground mb-6 text-2xl font-bold">Also Supported</h3>
              <p class="text-muted-foreground mb-4">
                Our platform is flexible enough to support specific non-core clients such as:
              </p>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Running clubs</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Community organizations</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <p class="text-muted-foreground">Event organizers</p>
                </div>
                <div class="flex items-start gap-3">
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
    <section class="bg-muted/30 py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Shield class="h-4 w-4" />
              OUR PRINCIPLE: SUPPLIER OWNERSHIP FIRST
            </div>
            <h2
              class="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
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
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <Zap class="h-4 w-4" />
              HOW SUTIT WORKS
            </div>
            <h2
              class="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
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
    <section class="bg-muted/30 py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <div
              class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            >
              <TrendingUp class="h-4 w-4" />
              WHY MSEs GROW WITH SUTIT
            </div>
            <h2
              class="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              A Platform That
              <span class="text-primary">Scales With You</span>
            </h2>
            <p class="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
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
    <section class="relative overflow-hidden py-20 lg:py-32">
      <div
        class="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-r to-transparent"
      ></div>
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="bg-primary/5 absolute top-1/2 left-1/4 h-96 w-96 rounded-full blur-3xl"></div>
        <div class="bg-primary/3 absolute top-1/4 right-1/4 h-64 w-64 rounded-full blur-3xl"></div>
      </div>

      <div class="relative container mx-auto px-4">
        <Card
          class="from-primary/10 via-primary/5 border-primary/20 mx-auto max-w-4xl bg-gradient-to-br to-transparent backdrop-blur-sm"
        >
          <div class="p-12 text-center lg:p-16">
            <h2
              class="text-foreground mb-6 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              Bring Discipline to
              <span class="text-primary">Your Supply Chain</span>
            </h2>
            <p class="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed">
              Sutit.org turns informal workflows into structured, accountable processes — designed
              for the realities of MSEs and the cottage industry.
            </p>
            <div class="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" class="group transition-all duration-300 hover:shadow-xl">
                Start Using Sutit
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                class="transition-all duration-300 hover:shadow-lg"
              >
                Contact Us for Onboarding
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>
