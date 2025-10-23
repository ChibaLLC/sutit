<script setup lang="ts">
import { ref } from "vue";
import { Github, Twitter, Linkedin, Mail } from "lucide-vue-next";

const socialLinks = ref([
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
]);

const footerLinks = ref([
  {
    title: "Product",
    links: ["Features", "Pricing", "Templates", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "GDPR"],
  },
]);
</script>

<template>
  <footer
    class="border-t border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
            >
              <NuxtImg src="/logo.jpeg" class="rounded-md"></NuxtImg>
            </div>
            <span
              class="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              SUTIT
            </span>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed">
            The most powerful form builder for modern teams.
          </p>
          <!-- Social Links -->
          <div class="flex gap-3 pt-2">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            >
              <component
                :is="social.icon"
                class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </a>
          </div>
        </div>

        <!-- Footer Links -->
        <div
          v-for="section in footerLinks"
          :key="section.title"
          class="space-y-3"
        >
          <h3 class="text-sm font-semibold text-foreground">
            {{ section.title }}
          </h3>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link">
              <a
                href="#"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 relative group"
              >
                {{ link }}
                <span
                  class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-300"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div
        class="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"
      />

      <!-- Bottom Section -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} SUTIT. All rights reserved.
        </p>
        <div class="flex gap-4 text-xs text-muted-foreground">
          <a href="#" class="hover:text-primary transition-colors">Status</a>
          <span class="text-border">•</span>
          <a href="#" class="hover:text-primary transition-colors">Changelog</a>
          <span class="text-border">•</span>
          <a href="#" class="hover:text-primary transition-colors">API Docs</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Smooth animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

footer {
  animation: slideUp 0.6s ease-out;
}
</style>
