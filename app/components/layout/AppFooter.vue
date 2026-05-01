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
    class="border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 mt-auto w-full border-t backdrop-blur-md"
  >
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <!-- Brand -->
        <div class="flex items-center gap-2">
          <div
            class="from-primary to-primary/60 flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br"
          >
            <NuxtImg src="/logo.jpeg" class="rounded-md"></NuxtImg>
          </div>
          <span
            class="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-sm font-semibold text-transparent"
          >
            SUTIT
          </span>
        </div>

        <!-- Navigation Links -->
        <div class="flex gap-6 text-xs">
          <NuxtLink to="/about" class="text-muted-foreground hover:text-primary transition-colors">
            About
          </NuxtLink>
          <NuxtLink
            to="/marketplace"
            class="text-muted-foreground hover:text-primary transition-colors"
          >
            Marketplace
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-muted-foreground hover:text-primary transition-colors"
          >
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
            class="bg-muted hover:bg-primary/10 group flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
          >
            <component
              :is="social.icon"
              class="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 transition-colors"
            />
          </a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-border/20 mt-4 border-t pt-4 text-center">
        <p class="text-muted-foreground text-xs">
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
