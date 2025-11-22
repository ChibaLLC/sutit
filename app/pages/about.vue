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
} from "lucide-vue-next";
const members = [
  {
    name: "Saxo Munene",
    description: "",
    role: "Founding Partner",
    links: [
      {
        link: "",
        icon: "",
      },
    ],
  },
  {
    name: "Bosire Allan",
    description: "",
    role: "Software Engineer",
    links: [
      {
        link: "",
        icon: "",
      },
    ],
  },
  {
    name: "Antoney Sydney",
    description: "",
    role: "Founding Partner",
    links: [
      {
        link: "",
        icon: "",
      },
    ],
  },
  {
    name: "Kemboi Elvis",
    description: "Fullstack Engineer",
    role: "Software Engineer",
    links: [
      {
        link: "https://github.com/kemboi22",
        icon: Github,
      },
      {
        link: "https://linkedin.com/in/elvis-kemboi-18a55924b/",
        icon: Linkedin,
      },
      {
        link: "https://x.com/kemboielvis22",
        icon: Twitter,
      },
    ],
  },
];
</script>
<template>
  <div>
    <!-- Story Section -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <!-- Story Content -->
            <div class="order-2 lg:order-1">
              <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Rocket class="w-4 h-4" />
                Our Journey
              </div>

              <h2
                class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
              >
                From Frustration to
                <span class="text-primary">Innovation</span>
              </h2>

              <div
                class="space-y-6 text-muted-foreground text-lg leading-relaxed"
              >
                <p>
                  Founded in 2020 during a global shift to digital workflows,
                  SUTIT Forms was born from a simple yet powerful observation:
                  existing form builders forced users to choose between
                  simplicity and functionality.
                </p>
                <p>
                  Our founders, having struggled with clunky interfaces and
                  limited customization options across countless projects,
                  envisioned a platform that would bridge this gap. They set out
                  to create the most intuitive form builder that doesn't
                  compromise on advanced features.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 users across 100+
                  countries, helping them create more than 1 million forms that
                  have collected billions of responses and transformed how
                  organizations gather insights.
                </p>
              </div>

              <div class="flex items-center gap-4 mt-8">
                <div class="flex -space-x-2">
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-background"
                  ></div>
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 border-2 border-background"
                  ></div>
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 border-2 border-background"
                  ></div>
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 border-2 border-background"
                  ></div>
                </div>
                <div>
                  <p class="font-semibold text-foreground">
                    Trusted by teams worldwide
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Join thousands of happy customers
                  </p>
                </div>
              </div>
            </div>

            <!-- Mission Card -->
            <div class="order-1 lg:order-2">
              <Card
                class="p-8 lg:p-10 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20 hover:shadow-2xl transition-all duration-500"
              >
                <div class="text-center">
                  <div
                    class="w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Target class="w-10 h-10 text-primary" />
                  </div>
                  <h3 class="text-2xl font-bold mb-4 text-foreground">
                    Our Mission
                  </h3>
                  <p class="text-muted-foreground leading-relaxed text-lg">
                    To democratize data collection by making powerful form
                    building accessible to everyone, regardless of technical
                    expertise or budget constraints.
                  </p>
                  <div class="mt-6 pt-6 border-t border-primary/10">
                    <p class="text-sm text-primary font-medium">
                      "Empowering every team to collect data beautifully"
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 lg:py-32 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Heart class="w-4 h-4" />
              Our Values
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              The Principles That
              <span class="text-primary">Drive Us</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Everything we do is guided by these core values that shape our
              culture, products, and relationships.
            </p>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Users2 class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">
                User-Centric
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                Every decision we make starts with understanding our users'
                needs and creating solutions that genuinely improve their
                workflow.
              </p>
            </Card>

            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Lightbulb class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">Innovation</h3>
              <p class="text-muted-foreground leading-relaxed">
                We continuously push boundaries, experimenting with new
                technologies to deliver cutting-edge form building experiences.
              </p>
            </Card>

            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Shield class="w-8 h-8 text-purple-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">
                Security First
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                We maintain the highest standards of data protection, ensuring
                your information is always safe and compliant.
              </p>
            </Card>

            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Users class="w-8 h-8 text-orange-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">
                Collaboration
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                Great products are built through teamwork, both within our
                company and with our amazing community.
              </p>
            </Card>

            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Zap class="w-8 h-8 text-red-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">
                Performance
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                We're obsessed with speed and reliability, ensuring our platform
                works flawlessly at any scale.
              </p>
            </Card>

            <Card
              class="group p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/70 backdrop-blur-sm"
            >
              <div
                class="w-16 h-16 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-600/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <Globe class="w-8 h-8 text-teal-600" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-foreground">
                Accessibility
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                We're committed to making our platform accessible to users of
                all abilities and backgrounds worldwide.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Users class="w-4 h-4" />
              Our Team
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              Meet the People
              <span class="text-primary">Behind SUTIT</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              A passionate team of designers, developers, and dreamers working
              to transform how the world collects data.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              v-for="member in members"
              :key="member.name"
              class="group p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-background to-background/50"
            >
              <div class="relative mb-6">
                <div
                  class="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  <User class="w-12 h-12 text-blue-600" />
                </div>
                <div
                  class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center"
                >
                  <div
                    class="w-2 h-2 rounded-full bg-white animate-pulse"
                  ></div>
                </div>
              </div>
              <h3 class="text-xl font-bold mb-2 text-foreground">
                {{ member.name }}
              </h3>
              <p class="text-primary font-medium text-sm mb-3">
                {{ member.role }}
              </p>
              <p class="text-muted-foreground text-sm leading-relaxed mb-4">
                {{ member.description }}
              </p>
              <div class="flex justify-center gap-3">
                <a
                  v-for="link in member.links"
                  :key="link.link"
                  :href="link.link"
                  target="_blank"
                  class="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <component :is="link.icon" class="w-4 h-4" />
                </a>
              </div>
            </Card>

            <!-- Join Us Card -->
            <Card
              class="group p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
            >
              <div class="mb-6">
                <div
                  class="w-24 h-24 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/30 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  <Plus class="w-12 h-12 text-primary" />
                </div>
              </div>
              <h3 class="text-xl font-bold mb-2 text-foreground">
                Join Our Team
              </h3>
              <p class="text-primary font-medium text-sm mb-3">We're Hiring!</p>
              <p class="text-muted-foreground text-sm leading-relaxed mb-6">
                Want to help shape the future of form building? We're always
                looking for talented individuals to join our mission.
              </p>
              <Button variant="outline" size="sm" class="group">
                View Open Positions
                <ArrowRight
                  class="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Culture & Perks Section -->
    <section class="py-20 lg:py-32 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Coffee class="w-4 h-4" />
              Life at SUTIT
            </div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              More Than Just
              <span class="text-primary">Work</span>
            </h2>
            <p
              class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              We believe great work happens when great people come together in
              an environment that supports growth, creativity, and well-being.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"
                >
                  <MapPin class="w-5 h-5 text-blue-600" />
                </div>
                <h3 class="font-semibold text-foreground">Remote First</h3>
              </div>
              <p class="text-muted-foreground text-sm">
                Work from anywhere in the world. We provide the tools and
                support you need to thrive remotely.
              </p>
            </Card>

            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"
                >
                  <Banknote class="w-5 h-5 text-green-600" />
                </div>
                <h3 class="font-semibold text-foreground">
                  Competitive Equity
                </h3>
              </div>
              <p class="text-muted-foreground text-sm">
                Everyone gets meaningful equity. When SUTIT succeeds, we all
                succeed together.
              </p>
            </Card>

            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"
                >
                  <GraduationCap class="w-5 h-5 text-purple-600" />
                </div>
                <h3 class="font-semibold text-foreground">Learning Budget</h3>
              </div>
              <p class="text-muted-foreground text-sm">
                $2,000 annual budget for conferences, courses, books, and any
                learning resources you need.
              </p>
            </Card>

            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"
                >
                  <Heart class="w-5 h-5 text-orange-600" />
                </div>
                <h3 class="font-semibold text-foreground">Health & Wellness</h3>
              </div>
              <p class="text-muted-foreground text-sm">
                Comprehensive health coverage, mental health support, and
                wellness stipends for gym memberships.
              </p>
            </Card>

            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"
                >
                  <Calendar class="w-5 h-5 text-red-600" />
                </div>
                <h3 class="font-semibold text-foreground">Unlimited PTO</h3>
              </div>
              <p class="text-muted-foreground text-sm">
                Take the time you need to recharge. We trust you to manage your
                time and deliver great work.
              </p>
            </Card>

            <Card
              class="p-6 hover:shadow-lg transition-shadow bg-background/70 backdrop-blur-sm"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center"
                >
                  <Laptop class="w-5 h-5 text-teal-600" />
                </div>
                <h3 class="font-semibold text-foreground">
                  Top-Tier Equipment
                </h3>
              </div>
              <p class="text-muted-foreground text-sm">
                Latest MacBook Pro, 4K monitor, ergonomic setup, and any tools
                you need to do your best work.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
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
              Ready to Transform Your
              <span class="text-primary">Data Collection?</span>
            </h2>
            <p
              class="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join over 50,000 teams who trust SUTIT Forms for their data
              collection needs. Start building beautiful forms today.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                class="group hover:shadow-xl transition-all duration-300"
              >
                Start Free
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                class="hover:shadow-lg transition-all duration-300"
              >
                <Calendar class="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>
