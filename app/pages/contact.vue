<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"
      ></div>
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000"
        ></div>
      </div>

      <div class="container mx-auto px-4 py-20 lg:py-32 relative">
        <div class="max-w-4xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 backdrop-blur-sm"
          >
            <MessageCircle class="w-4 h-4" />
            <span class="text-sm font-medium">Get in Touch</span>
          </div>

          <h1
            class="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Let's Start a
            <span class="block text-primary">Conversation</span>
          </h1>

          <p
            class="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions about SUUTIT Forms? Need help getting started? Our
            team is here to help you build amazing forms.
          </p>

          <!-- Quick Contact Options -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            <Card
              class="p-6 bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
            >
              <div class="text-center">
                <div
                  class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/20 transition-colors"
                >
                  <Phone class="w-6 h-6 text-blue-600" />
                </div>
                <h3 class="font-semibold text-foreground mb-1">Call Us</h3>
                <p class="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </Card>

            <Card
              class="p-6 bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
            >
              <div class="text-center">
                <div
                  class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/20 transition-colors"
                >
                  <Mail class="w-6 h-6 text-green-600" />
                </div>
                <h3 class="font-semibold text-foreground mb-1">Email Us</h3>
                <p class="text-sm text-muted-foreground">
                  hello@suutitforms.com
                </p>
              </div>
            </Card>

            <Card
              class="p-6 bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
            >
              <div class="text-center">
                <div
                  class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 transition-colors"
                >
                  <MessageSquare class="w-6 h-6 text-purple-600" />
                </div>
                <h3 class="font-semibold text-foreground mb-1">Live Chat</h3>
                <p class="text-sm text-muted-foreground">
                  Available 9AM-6PM EST
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info Section -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <!-- Contact Form -->
            <div class="order-2 lg:order-1">
              <Card
                class="p-8 lg:p-10 bg-background/70 backdrop-blur-sm shadow-xl"
              >
                <div class="mb-8">
                  <h2
                    class="text-2xl md:text-3xl font-bold text-foreground mb-3"
                  >
                    Send us a Message
                  </h2>
                  <p class="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </p>
                </div>

                <form @submit.prevent="submitForm" class="space-y-6">
                  <!-- Name Fields -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label for="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        v-model="form.firstName"
                        placeholder="John"
                        required
                        class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        v-model="form.lastName"
                        placeholder="Doe"
                        required
                        class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <!-- Email & Company -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label for="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        v-model="form.email"
                        placeholder="john@company.com"
                        required
                        class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="company">Company</Label>
                      <Input
                        id="company"
                        v-model="form.company"
                        placeholder="Acme Inc."
                        class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <!-- Subject -->
                  <div class="space-y-2">
                    <Label for="subject">Subject *</Label>
                    <Select v-model="form.subject" required>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="sales">Sales Question</SelectItem>
                        <SelectItem value="support"
                          >Technical Support</SelectItem
                        >
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="billing"
                          >Billing & Pricing</SelectItem
                        >
                        <SelectItem value="feedback"
                          >Feature Request</SelectItem
                        >
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Message -->
                  <div class="space-y-2">
                    <Label for="message">Message *</Label>
                    <Textarea
                      id="message"
                      v-model="form.message"
                      placeholder="Tell us how we can help you..."
                      rows="6"
                      required
                      class="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <!-- Priority -->
                  <div class="space-y-3">
                    <Label>Priority Level</Label>
                    <div class="flex gap-4">
                      <div class="flex items-center space-x-2">
                        <RadioGroup v-model="form.priority">
                          <div class="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label
                              for="low"
                              class="text-sm font-normal cursor-pointer"
                              >Low</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroup v-model="form.priority">
                          <div class="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label
                              for="medium"
                              class="text-sm font-normal cursor-pointer"
                              >Medium</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroup v-model="form.priority">
                          <div class="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label
                              for="high"
                              class="text-sm font-normal cursor-pointer"
                              >High</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <!-- Newsletter Subscription -->
                  <div
                    class="flex items-center space-x-2 p-4 rounded-lg bg-muted/50"
                  >
                    <Checkbox id="newsletter" v-model="form.newsletter" />
                    <Label
                      for="newsletter"
                      class="text-sm font-normal cursor-pointer flex-1"
                    >
                      Subscribe to our newsletter for product updates and tips
                    </Label>
                  </div>

                  <!-- Submit Button -->
                  <Button
                    type="submit"
                    size="lg"
                    class="w-full group hover:shadow-lg transition-all duration-300"
                    :disabled="isSubmitting"
                  >
                    <span v-if="!isSubmitting" class="flex items-center">
                      Send Message
                      <Send
                        class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                    <span v-else class="flex items-center">
                      <svg
                        class="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  </Button>

                  <!-- Success Message -->
                  <div
                    v-if="showSuccess"
                    class="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                  >
                    <div class="flex items-center">
                      <CheckCircle class="h-5 w-5 text-green-600 mr-2" />
                      <p class="text-sm text-green-800 dark:text-green-200">
                        Thank you! Your message has been sent successfully.
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            <!-- Contact Information -->
            <div class="order-1 lg:order-2 space-y-8">
              <!-- Contact Info Card -->
              <Card
                class="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
              >
                <h3 class="text-2xl font-bold text-foreground mb-6">
                  Get in Touch
                </h3>

                <div class="space-y-6">
                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <MapPin class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-foreground mb-1">Office</h4>
                      <p class="text-muted-foreground text-sm leading-relaxed">
                        123 Innovation Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Phone class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-foreground mb-1">Phone</h4>
                      <p class="text-muted-foreground text-sm">
                        +1 (555) 123-4567
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        Mon-Fri 9AM-6PM EST
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Mail class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-foreground mb-1">Email</h4>
                      <p class="text-muted-foreground text-sm">
                        hello@suutitforms.com
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Clock class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-foreground mb-1">
                        Support Hours
                      </h4>
                      <p class="text-muted-foreground text-sm">
                        24/7 for critical issues
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        General support: Mon-Fri 9AM-6PM EST
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Social Links -->
                <div class="mt-8 pt-6 border-t border-primary/10">
                  <h4 class="font-semibold text-foreground mb-4">Follow Us</h4>
                  <div class="flex gap-3">
                    <a
                      href="#"
                      class="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                    >
                      <Twitter
                        class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                    >
                      <Linkedin
                        class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                    >
                      <Github
                        class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                    >
                      <Youtube
                        class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </a>
                  </div>
                </div>
              </Card>

              <!-- FAQ Quick Links -->
              <Card class="p-6">
                <h3 class="text-xl font-bold text-foreground mb-4">
                  Quick Help
                </h3>
                <div class="space-y-3">
                  <a
                    href="#"
                    class="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span class="text-sm font-medium"
                      >Getting Started Guide</span
                    >
                    <ArrowRight
                      class="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                  <a
                    href="#"
                    class="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span class="text-sm font-medium">Pricing & Plans</span>
                    <ArrowRight
                      class="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                  <a
                    href="#"
                    class="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span class="text-sm font-medium">API Documentation</span>
                    <ArrowRight
                      class="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                  <a
                    href="#"
                    class="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span class="text-sm font-medium">Status Page</span>
                    <ArrowRight
                      class="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                </div>
              </Card>

              <!-- Enterprise Contact -->
              <Card
                class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-start gap-3">
                  <Building class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4
                      class="font-semibold text-blue-900 dark:text-blue-100 mb-2"
                    >
                      Enterprise Sales
                    </h4>
                    <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Need a custom solution for your organization? Our
                      enterprise team is here to help.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      class="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Support Categories -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Can We Help?
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the best way to get the support you need
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              class="group p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors"
              >
                <HelpCircle class="w-6 h-6 text-green-600" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-foreground">
                Help Center
              </h3>
              <p class="text-muted-foreground text-sm mb-4">
                Search our knowledge base for instant answers to common
                questions.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="group-hover:bg-green-50 dark:group-hover:bg-green-950/20 transition-colors"
              >
                Browse Articles
                <ArrowRight class="ml-2 h-3 w-3" />
              </Button>
            </Card>

            <Card
              class="group p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors"
              >
                <MessageSquare class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-foreground">
                Live Chat
              </h3>
              <p class="text-muted-foreground text-sm mb-4">
                Chat with our support team in real-time for quick assistance.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 transition-colors"
              >
                Start Chat
                <ArrowRight class="ml-2 h-3 w-3" />
              </Button>
            </Card>

            <Card
              class="group p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors"
              >
                <Users class="w-6 h-6 text-purple-600" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-foreground">
                Community
              </h3>
              <p class="text-muted-foreground text-sm mb-4">
                Connect with other users and share tips in our community forum.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20 transition-colors"
              >
                Join Community
                <ArrowRight class="ml-2 h-3 w-3" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p class="text-lg text-muted-foreground">
              Quick answers to common questions about SUUTIT Forms
            </p>
          </div>

          <div class="space-y-4">
            <Card
              v-for="(faq, index) in faqs"
              :key="index"
              class="overflow-hidden"
            >
              <button
                @click="toggleFaq(index)"
                class="w-full p-6 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <h3 class="font-semibold text-foreground pr-4">
                  {{ faq.question }}
                </h3>
                <ChevronDown
                  class="w-5 h-5 text-muted-foreground transition-transform duration-200"
                  :class="{ 'rotate-180': openFaq === index }"
                />
              </button>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="openFaq === index" class="px-6 pb-6">
                  <p class="text-muted-foreground leading-relaxed">
                    {{ faq.answer }}
                  </p>
                </div>
              </transition>
            </Card>
          </div>

          <div class="text-center mt-8">
            <p class="text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Button variant="outline">
              Contact Support
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-16 bg-muted/30 border-t">
      <div class="container mx-auto px-4">
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          <div class="lg:col-span-1">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg"
              >
                <div
                  class="flex h-full w-full items-center justify-center text-white font-bold"
                >
                  S
                </div>
              </div>
              <div class="flex flex-col">
                <span
                  class="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                  style="
                    font-family:
                      &quot;Inter&quot;,
                      &quot;SF Pro Display&quot;,
                      -apple-system,
                      sans-serif;
                    font-variation-settings: &quot;wght&quot; 900;
                  "
                >
                  SUUTIT
                </span>
                <span class="text-xs text-muted-foreground font-medium">
                  FORMS
                </span>
              </div>
            </div>
            <p class="text-sm text-muted-foreground leading-relaxed mb-6">
              The most powerful and intuitive form builder for modern teams.
            </p>
          </div>

          <div>
            <h3 class="font-semibold mb-6 text-foreground">Product</h3>
            <ul class="space-y-3 text-sm text-muted-foreground">
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
            <h3 class="font-semibold mb-6 text-foreground">Support</h3>
            <ul class="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Help Center</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Documentation</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >API Reference</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors"
                  >Status</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-6 text-foreground">Company</h3>
            <ul class="space-y-3 text-sm text-muted-foreground">
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
                  >Press</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-12 pt-8 border-t text-center text-sm text-muted-foreground"
        >
          <p>&copy; 2025 SUUTIT Forms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  MessageCircle,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Building,
  HelpCircle,
  Users,
  ChevronDown,
} from "lucide-vue-next";

// Form state
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  subject: "",
  message: "",
  priority: "medium",
  newsletter: false,
});

const isSubmitting = ref(false);
const showSuccess = ref(false);
const openFaq = ref<number | null>(null);

// FAQ data
const faqs = ref([
  {
    question: "How do I get started with SUUTIT Forms?",
    answer:
      "Getting started is easy! Simply sign up for a free account, choose a template or start from scratch, and use our drag-and-drop builder to create your first form. You can have a form up and running in minutes.",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "Our free plan includes up to 100 form submissions per month, basic form builder, email notifications, and access to our template library. You can upgrade anytime for more features and higher limits.",
  },
  {
    question: "Can I integrate SUUTIT Forms with other tools?",
    answer:
      "Absolutely! We offer integrations with popular tools like Zapier, Slack, Google Sheets, Mailchimp, and many more. You can also use our API to build custom integrations.",
  },
  {
    question: "How secure is my data?",
    answer:
      "Security is our top priority. We use enterprise-grade encryption, are GDPR compliant, and follow industry best practices for data protection. Your data is stored securely and never shared with third parties.",
  },
  {
    question: "Can I customize the look of my forms?",
    answer:
      "Yes! SUUTIT Forms offers extensive customization options including themes, colors, fonts, custom CSS, and branding options. You can make your forms match your brand perfectly.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer multiple support channels including live chat, email support, comprehensive documentation, video tutorials, and a community forum. Premium plans include priority support.",
  },
  {
    question: "Can I export my form data?",
    answer:
      "Yes, you can export your form submissions in various formats including CSV, Excel, and JSON. You can also set up automated exports to your preferred tools using our integrations.",
  },
  {
    question: "Do you offer enterprise solutions?",
    answer:
      "Yes! We offer enterprise plans with advanced features like SSO, custom branding, dedicated support, SLA guarantees, and more. Contact our sales team to learn about enterprise options.",
  },
]);

// Methods
const submitForm = async () => {
  isSubmitting.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Show success message
    showSuccess.value = true;

    // Reset form
    form.value = {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      subject: "",
      message: "",
      priority: "medium",
      newsletter: false,
    };

    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.error("Form submission failed:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>
