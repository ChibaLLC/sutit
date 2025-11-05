<script setup lang="ts">
import { Github, Twitter, Linkedin, Mail } from "lucide-vue-next";

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];
</script>

<template>
  <footer
    class="border-t border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Brand -->
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
          >
            <NuxtImg src="/logo.jpeg" class="rounded-md"></NuxtImg>
          </div>
          <span
            class="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            SUTIT
          </span>
        </div>

        <!-- Navigation Links -->
        <div class="flex gap-6 text-xs">
          <NuxtLink to="/about" class="text-muted-foreground hover:text-primary transition-colors">
            About
          </NuxtLink>
          <NuxtLink to="/marketplace" class="text-muted-foreground hover:text-primary transition-colors">
            Marketplace
          </NuxtLink>
          <NuxtLink to="/contact" class="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </NuxtLink>
        </div>

        <!-- Social Links -->
        <div class="flex gap-2">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            :aria-label="social.label"
            class="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <component
              :is="social.icon"
              class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"
            />
          </a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="text-center mt-4 pt-4 border-t border-border/20">
        <p class="text-xs text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} SUTIT. All rights reserved.
        </p>
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
