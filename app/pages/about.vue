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
  description: "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry. We provide digital backbone, SLA tracking, and delivery-promise enforcement.",
  keywords: "Kenyan supply chain, MSE coordination, cottage industry, delivery tracking, SLA enforcement, digital backbone",
  author: "Sutit.org",
  robots: "index,follow,max-image-preview:large",
  ogTitle: "About Sutit.org - Organic Kenyan Supply Chain Coordination Platform",
  ogDescription: "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry.",
  ogImage: "/logo.jpeg",
  ogImageAlt: "Sutit.org - Kenyan Supply Chain Platform",
  ogUrl: "/about",
  ogType: "website",
  ogSiteName: "Sutit.org",
  twitterCard: "summary_large_image",
  twitterSite: "@sutitorg",
  twitterCreator: "@sutitorg",
  twitterTitle: "About Sutit.org - Organic Kenyan Supply Chain Coordination Platform",
  twitterDescription: "Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry.",
  twitterImage: "/logo.jpeg",
  twitterImageAlt: "Sutit.org - Kenyan Supply Chain Platform",
  themeColor: "#2563eb",
  colorScheme: "light dark",
});
</script>
<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-background">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Globe class="w-4 h-4" />
            <span class="text-sm font-medium">ORGANIC KENYAN SOLUTION</span>
          </div>

          <h1
            class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span class="text-primary">Sutit.org</span>
            <br />
            Supply Chain Coordination Platform
          </h1>

          <p
            class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Sutit.org is an organic Kenyan supply-chain coordination platform built for Micro & Small Enterprises and the Cottage Industry. We're designed from the ground up around how Kenyan businesses actually operate - irregular logistics, cash-based transactions, tight delivery promises, and customers who expect instant accountability.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" class="group">
              Get Started with Sutit
              <ArrowRight
                class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button size="lg" variant="outline">
              How Sutit Works
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Value Proposition -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div>
              <h2
                class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
              >
                Real Control for
                <span class="text-primary">Kenyan MSEs</span>
              </h2>

              <div
                class="space-y-6 text-muted-foreground text-lg leading-relaxed"
              >
                <p>
                  Sutit gives MSE suppliers real control: your orders, your timelines, your logistics, your customer relationships.
                </p>
                <p>
                  We provide the digital backbone, SLA tracking, delivery-promise enforcement, and reconciliation, so small businesses can run with big-business discipline.
                </p>
                <p>
                  MSEs are our core. But whenever a bigger client faces the same coordination chaos, our engine scales to them too.
                </p>
                <p>
                  As Kenyan MSEs grow, Sutit grows with them, strengthening their partners and tightening their entire supply chain ecosystem.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package class="w-5 h-5 text-primary" />
                  </div>
                  <h3 class="font-semibold">Your Orders</h3>
                </div>
                <p class="text-muted-foreground text-sm">Complete control over order management and customer relationships</p>
              </div>

              <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock class="w-5 h-5 text-primary" />
                  </div>
                  <h3 class="font-semibold">Your Timelines</h3>
                </div>
                <p class="text-muted-foreground text-sm">Set and enforce delivery promises with automated SLA tracking</p>
              </div>

              <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck class="w-5 h-5 text-primary" />
                  </div>
                  <h3 class="font-semibold">Your Logistics</h3>
                </div>
                <p class="text-muted-foreground text-sm">Manage delivery your way with full operational control</p>
              </div>

              <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users class="w-5 h-5 text-primary" />
                  </div>
                  <h3 class="font-semibold">Your Relationships</h3>
                </div>
                <p class="text-muted-foreground text-sm">Maintain direct customer ownership while we handle coordination</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Features Section -->
    <section class="py-20 lg:py-32 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Target class="w-4 h-4" />
              THE SUTIT SOLUTION
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              Your Supply Chain,
              <span class="text-primary">Disciplined. Digitized. Enforceable.</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Sutit.org transforms the way MSEs run their operations by providing:
            </p>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    1. Order Coordination
                  </h3>
                  <p class="text-muted-foreground leading-relaxed">
                    Digital order intake and confirmation — simple for customers, structured for suppliers.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    2. Delivery Timeline Enforcement (SLA)
                  </h3>
                  <p class="text-muted-foreground leading-relaxed">
                    Suppliers set their own delivery timelines. Sutit tracks performance and enforces accountability with automated clawbacks.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    3. Payments & Reconciliation
                  </h3>
                  <p class="text-muted-foreground leading-relaxed">
                    We handle the payment flow, adjust for SLA compliance, and generate a clean, auditable ledger for both sides.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-foreground">
                    4. Workflow Tools Powered by Forms
                  </h3>
                  <p class="text-muted-foreground leading-relaxed">
                    Our forms engine supports: order requests, event registrations, service bookings, customer feedback. These tools power MSE operations without defining the product.
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
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Users class="w-4 h-4" />
              WHO WE SERVE
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              Purpose-Built for
              <span class="text-primary">MSEs and the Cottage Industry</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Sutit.org is designed for Micro & Small Enterprises - from home-based cottage producers to growing local suppliers - who need structure without complexity.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 class="text-2xl font-bold mb-6 text-foreground">Core Focus</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p class="font-medium mb-1">Home-based cottage producers</p>
                    <p class="text-sm text-muted-foreground">Turn your craft into a structured business</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p class="font-medium mb-1">Growing local suppliers</p>
                    <p class="text-sm text-muted-foreground">Scale operations without losing control</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p class="font-medium mb-1">Micro & Small Enterprises</p>
                    <p class="text-sm text-muted-foreground">Big business discipline for small businesses</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-2xl font-bold mb-6 text-foreground">Also Supported</h3>
              <p class="text-muted-foreground mb-4">
                Our platform is flexible enough to support specific non-core clients such as:
              </p>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p class="text-muted-foreground">Running clubs</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p class="text-muted-foreground">Community organizations</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p class="text-muted-foreground">Event organizers</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p class="text-muted-foreground">Small initiatives</p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mt-4 italic">
                These groups use our workflow tools, but MSE supply chains remain the core mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Supplier Ownership Principle Section -->
    <section class="py-20 lg:py-32 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Shield class="w-4 h-4" />
              OUR PRINCIPLE: SUPPLIER OWNERSHIP FIRST
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              You Own the Relationship.
              <span class="text-primary">We Handle the Coordination.</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div class="space-y-4">
              <h3 class="text-xl font-bold mb-4 text-foreground">With Sutit.org:</h3>
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
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Target class="w-8 h-8 text-primary" />
              </div>
              <p class="text-muted-foreground text-center leading-relaxed">
                Sutit runs the background layer that brings discipline, accountability, and trust to every order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How Sutit Works Section -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Zap class="w-4 h-4" />
              HOW SUTIT WORKS
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              A Simple 5-Step
              <span class="text-primary">Process</span>
            </h2>
          </div>

          <div class="space-y-8 max-w-4xl mx-auto">
            <div class="flex gap-6">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">Customer Places Order</h3>
                <p class="text-muted-foreground">
                  Through a Sutit link or form, customers submit clean, structured order requests.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">Supplier Confirms & Sets Delivery SLA</h3>
                <p class="text-muted-foreground">
                  You confirm availability and set the expected delivery time.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">Supplier Executes Delivery</h3>
                <p class="text-muted-foreground">
                  Using your own logistics or chosen partners — Sutit does NOT interfere.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">SLA Monitoring & Clawback Enforcement</h3>
                <p class="text-muted-foreground">
                  If delivery is late, a clawback automatically applies. If on time, settlement proceeds smoothly.
                </p>
              </div>
            </div>

            <div class="flex gap-6">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2 text-foreground">Automated Reconciliation</h3>
                <p class="text-muted-foreground">
                  Every order gets a transparent ledger: who paid, what was delivered, timelines, and final settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why MSEs Grow With Sutit Section -->
    <section class="py-20 lg:py-32 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <TrendingUp class="w-4 h-4" />
              WHY MSEs GROW WITH SUTIT
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              A Platform That
              <span class="text-primary">Scales With You</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              As MSEs evolve, Sutit evolves:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">More Orders</h3>
              <p class="text-muted-foreground text-sm">
                Handle increased volume without losing control or quality
              </p>
            </div>

            <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">More Partners</h3>
              <p class="text-muted-foreground text-sm">
                Coordinate with multiple suppliers and partners seamlessly
              </p>
            </div>

            <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">More Operational Complexity</h3>
              <p class="text-muted-foreground text-sm">
                Manage sophisticated workflows while maintaining simplicity
              </p>
            </div>

            <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">More Visibility</h3>
              <p class="text-muted-foreground text-sm">
                Gain insights into your operations with comprehensive tracking
              </p>
            </div>

            <div class="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">More Reliability</h3>
              <p class="text-muted-foreground text-sm">
                Build trust with consistent performance and accountability
              </p>
            </div>

            <div class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
              <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-2 text-foreground">Sutit grows through its MSEs</h3>
              <p class="text-muted-foreground text-sm">
                Supporting their supply chain maturity, not replacing it
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-20 lg:py-32 relative overflow-hidden">
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
        <Card
          class="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur-sm"
        >
          <div class="p-12 lg:p-16 text-center">
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
            >
              Bring Discipline to
              <span class="text-primary">Your Supply Chain</span>
            </h2>
            <p
              class="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Sutit.org turns informal workflows into structured, accountable processes — designed for the realities of MSEs and the cottage industry.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                class="group hover:shadow-xl transition-all duration-300"
              >
                Start Using Sutit
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                class="hover:shadow-lg transition-all duration-300"
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
