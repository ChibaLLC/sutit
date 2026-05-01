<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div
        class="from-primary/10 to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent"
      ></div>
      <!-- Animated Background Elements -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="bg-primary/5 absolute top-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full blur-3xl"
        ></div>
        <div
          class="bg-primary/3 absolute bottom-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl delay-1000"
        ></div>
      </div>

      <div class="relative container mx-auto px-4 py-20 lg:py-32">
        <div class="mx-auto max-w-4xl text-center">
          <div
            class="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm"
          >
            <MessageCircle class="h-4 w-4" />
            <span class="text-sm font-medium">Get in Touch</span>
          </div>

          <h1
            class="from-foreground via-foreground/90 to-foreground/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl"
          >
            Let's Start a
            <span class="text-primary block">Conversation</span>
          </h1>

          <p
            class="text-muted-foreground mx-auto mb-12 max-w-3xl text-xl leading-relaxed md:text-2xl"
          >
            Have questions about SUTIT Forms? Need help getting started? Our team is here to help
            you build amazing forms.
          </p>

          <!-- Quick Contact Options -->
          <div class="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card
              class="bg-background/50 border-primary/10 hover:border-primary/20 group cursor-pointer p-6 backdrop-blur-sm transition-all duration-300"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20"
                >
                  <Phone class="h-6 w-6 text-blue-600" />
                </div>
                <h3 class="text-foreground mb-1 font-semibold">Call Us</h3>
                <p class="text-muted-foreground text-sm">+254758673552 / +254718240819</p>
              </div>
            </Card>

            <Card
              class="bg-background/50 border-primary/10 hover:border-primary/20 group cursor-pointer p-6 backdrop-blur-sm transition-all duration-300"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 transition-colors group-hover:bg-green-500/20"
                >
                  <Mail class="h-6 w-6 text-green-600" />
                </div>
                <h3 class="text-foreground mb-1 font-semibold">Email Us</h3>
                <p class="text-muted-foreground text-sm">info@sutit.org</p>
              </div>
            </Card>

            <Card
              class="bg-background/50 border-primary/10 hover:border-primary/20 group cursor-pointer p-6 backdrop-blur-sm transition-all duration-300"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 transition-colors group-hover:bg-purple-500/20"
                >
                  <MessageSquare class="h-6 w-6 text-purple-600" />
                </div>
                <h3 class="text-foreground mb-1 font-semibold">Live Chat</h3>
                <p class="text-muted-foreground text-sm">Available 9AM-6PM EAT</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info Section -->
    <section class="py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-7xl">
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <!-- Contact Form -->
            <div class="order-2 lg:order-1">
              <Card class="bg-background/70 p-8 shadow-xl backdrop-blur-sm lg:p-10">
                <div class="mb-8">
                  <h2 class="text-foreground mb-3 text-2xl font-bold md:text-3xl">
                    Send us a Message
                  </h2>
                  <p class="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </div>

                <form @submit.prevent="submitForm" class="space-y-6">
                  <!-- Name Fields -->
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <Label for="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        v-model="form.firstName"
                        placeholder="John"
                        required
                        class="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        v-model="form.lastName"
                        placeholder="Doe"
                        required
                        class="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                      />
                    </div>
                  </div>

                  <!-- Email & Company -->
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <Label for="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        v-model="form.email"
                        placeholder="john@company.com"
                        required
                        class="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="company">Company</Label>
                      <Input
                        id="company"
                        v-model="form.company"
                        placeholder="Acme Inc."
                        class="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
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
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="billing">Billing & Pricing</SelectItem>
                        <SelectItem value="feedback">Feature Request</SelectItem>
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
                      class="focus:ring-primary/20 resize-none transition-all duration-200 focus:ring-2"
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
                            <Label for="low" class="cursor-pointer text-sm font-normal">Low</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroup v-model="form.priority">
                          <div class="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label for="medium" class="cursor-pointer text-sm font-normal"
                              >Medium</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroup v-model="form.priority">
                          <div class="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label for="high" class="cursor-pointer text-sm font-normal"
                              >High</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <!-- Newsletter Subscription -->
                  <div class="bg-muted/50 flex items-center space-x-2 rounded-lg p-4">
                    <Checkbox id="newsletter" v-model="form.newsletter" />
                    <Label for="newsletter" class="flex-1 cursor-pointer text-sm font-normal">
                      Subscribe to our newsletter for product updates and tips
                    </Label>
                  </div>

                  <!-- Submit Button -->
                  <Button
                    type="submit"
                    size="lg"
                    class="group w-full transition-all duration-300 hover:shadow-lg"
                    :disabled="isSubmitting"
                  >
                    <span v-if="!isSubmitting" class="flex items-center">
                      Send Message
                      <Send class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span v-else class="flex items-center">
                      <Loader2 class="mr-2 -ml-1 h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  </Button>

                  <!-- Success Message -->
                  <div
                    v-if="showSuccess"
                    class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950"
                  >
                    <div class="flex items-center">
                      <CheckCircle class="mr-2 h-5 w-5 text-green-600" />
                      <p class="text-sm text-green-800 dark:text-green-200">
                        Thank you! Your message has been sent successfully. We'll get back to you
                        within 24 hours.
                      </p>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            <!-- Contact Information -->
            <div class="order-1 space-y-8 lg:order-2">
              <!-- Contact Info Card -->
              <Card class="from-primary/5 to-primary/10 border-primary/20 bg-gradient-to-br p-8">
                <h3 class="text-foreground mb-6 text-2xl font-bold">Get in Touch</h3>

                <div class="space-y-6">
                  <div class="flex items-start gap-4">
                    <div
                      class="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <MapPin class="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h4 class="text-foreground mb-1 font-semibold">Office</h4>
                      <p class="text-muted-foreground text-sm leading-relaxed">
                        123 Innovation Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <Phone class="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h4 class="text-foreground mb-1 font-semibold">Phone</h4>
                      <p class="text-muted-foreground text-sm">+2547758673552 / 254718240819</p>
                      <p class="text-muted-foreground mt-1 text-xs">Mon-Fri 9AM-6PM EAT</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <Mail class="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h4 class="text-foreground mb-1 font-semibold">Email</h4>
                      <p class="text-muted-foreground text-sm">info@sutit.org</p>
                      <p class="text-muted-foreground mt-1 text-xs">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div
                      class="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <Clock class="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h4 class="text-foreground mb-1 font-semibold">Support Hours</h4>
                      <p class="text-muted-foreground text-sm">24/7 for critical issues</p>
                      <p class="text-muted-foreground mt-1 text-xs">
                        General support: Mon-Fri 9AM-6PM EAT
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Social Links -->
                <div class="border-primary/10 mt-8 border-t pt-6">
                  <h4 class="text-foreground mb-4 font-semibold">Follow Us</h4>
                  <div class="flex gap-3">
                    <a
                      href="#"
                      class="bg-muted hover:bg-primary/10 group flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    >
                      <Twitter
                        class="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="bg-muted hover:bg-primary/10 group flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    >
                      <Linkedin
                        class="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="bg-muted hover:bg-primary/10 group flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    >
                      <Github
                        class="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors"
                      />
                    </a>
                    <a
                      href="#"
                      class="bg-muted hover:bg-primary/10 group flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    >
                      <Youtube
                        class="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors"
                      />
                    </a>
                  </div>
                </div>
              </Card>

              <!-- FAQ Quick Links -->
              <Card class="p-6">
                <h3 class="text-foreground mb-4 text-xl font-bold">Quick Help</h3>
                <div class="space-y-3">
                  <a
                    href="#"
                    class="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
                  >
                    <span class="text-sm font-medium">Getting Started Guide</span>
                    <ArrowRight
                      class="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-1"
                    />
                  </a>
                  <a
                    href="#"
                    class="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
                  >
                    <span class="text-sm font-medium">Pricing & Plans</span>
                    <ArrowRight
                      class="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-1"
                    />
                  </a>
                  <a
                    href="#"
                    class="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
                  >
                    <span class="text-sm font-medium">API Documentation</span>
                    <ArrowRight
                      class="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-1"
                    />
                  </a>
                  <a
                    href="#"
                    class="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
                  >
                    <span class="text-sm font-medium">Status Page</span>
                    <ArrowRight
                      class="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </Card>

              <!-- Enterprise Contact -->
              <Card
                class="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20"
              >
                <div class="flex items-start gap-3">
                  <Building class="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
                  <div>
                    <h4 class="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                      Enterprise Sales
                    </h4>
                    <p class="mb-3 text-sm text-blue-700 dark:text-blue-300">
                      Need a custom solution for your organization? Our enterprise team is here to
                      help.
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
    <section class="bg-muted/30 py-20">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-6xl">
          <div class="mb-12 text-center">
            <h2 class="text-foreground mb-4 text-3xl font-bold md:text-4xl">How Can We Help?</h2>
            <p class="text-muted-foreground mx-auto max-w-2xl text-lg">
              Choose the best way to get the support you need
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card
              class="group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 transition-colors group-hover:bg-green-500/20"
              >
                <HelpCircle class="h-6 w-6 text-green-600" />
              </div>
              <h3 class="text-foreground mb-2 text-xl font-semibold">Help Center</h3>
              <p class="text-muted-foreground mb-4 text-sm">
                Search our knowledge base for instant answers to common questions.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="transition-colors group-hover:bg-green-50 dark:group-hover:bg-green-950/20"
              >
                Browse Articles
                <ArrowRight class="ml-2 h-3 w-3" />
              </Button>
            </Card>

            <Card
              class="group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20"
              >
                <MessageSquare class="h-6 w-6 text-blue-600" />
              </div>
              <h3 class="text-foreground mb-2 text-xl font-semibold">Live Chat</h3>
              <p class="text-muted-foreground mb-4 text-sm">
                Chat with our support team in real-time for quick assistance.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20"
              >
                Start Chat
                <ArrowRight class="ml-2 h-3 w-3" />
              </Button>
            </Card>

            <Card
              class="group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 transition-colors group-hover:bg-purple-500/20"
              >
                <Users class="h-6 w-6 text-purple-600" />
              </div>
              <h3 class="text-foreground mb-2 text-xl font-semibold">Community</h3>
              <p class="text-muted-foreground mb-4 text-sm">
                Connect with other users and share tips in our community forum.
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20"
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
        <div class="mx-auto max-w-4xl">
          <div class="mb-12 text-center">
            <h2 class="text-foreground mb-4 text-3xl font-bold md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p class="text-muted-foreground text-lg">
              Quick answers to common questions about SUTIT Forms
            </p>
          </div>

          <div class="space-y-4">
            <Card v-for="(faq, index) in faqs" :key="index" class="overflow-hidden">
              <button
                @click="toggleFaq(index)"
                class="hover:bg-muted/50 flex w-full items-center justify-between p-6 text-left transition-colors"
              >
                <h3 class="text-foreground pr-4 font-semibold">
                  {{ faq.question }}
                </h3>
                <ChevronDown
                  class="text-muted-foreground h-5 w-5 transition-transform duration-200"
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

          <div class="mt-8 text-center">
            <p class="text-muted-foreground mb-4">Can't find what you're looking for?</p>
            <Button variant="outline">
              Contact Support
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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
    Loader2,
  } from "lucide-vue-next";
  import { ref } from "vue";

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
      question: "How do I get started with SUTIT Forms?",
      answer:
        "Getting started is easy! Simply sign up for a free account, choose a template or start from scratch, and use our drag-and-drop builder to create your first form. You can have a form up and running in minutes.",
    },
    {
      question: "What's included in the free plan?",
      answer:
        "Our free plan includes up to 100 form submissions per month, basic form builder, email notifications, and access to our template library. You can upgrade anytime for more features and higher limits.",
    },
    {
      question: "Can I integrate SUTIT Forms with other tools?",
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
        "Yes! SUTIT Forms offers extensive customization options including themes, colors, fonts, custom CSS, and branding options. You can make your forms match your brand perfectly.",
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
