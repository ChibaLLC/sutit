<script setup lang="ts">
  import { useDark, useToggle } from "@vueuse/core";
  import {
    Menu,
    X,
    User,
    Sun,
    Moon,
    UserCircle,
    Settings,
    CreditCard,
    HelpCircle,
    LogOut,
    Sparkles,
    ArrowRight,
  } from "lucide-vue-next";
  import { ref } from "vue";

  import { useAuthStore } from "@/stores/auth";

  const mobileMenuOpen = ref(false);
  const authStore = useAuthStore();

  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Forms", href: "/forms" },
    { label: "Settings", href: "/settings" },
  ];

  const navs = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const logout = async () => {
    mobileMenuOpen.value = false;
    await authStore.logout();
  };
</script>
<template>
  <nav
    class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-20 items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="group flex items-center space-x-3">
            <div class="relative">
              <div
                class="from-primary absolute inset-0 rounded-xl bg-gradient-to-r to-purple-600 opacity-60 blur-lg transition-opacity group-hover:opacity-80"
              ></div>
              <div class="relative h-12 w-12 rounded-full">
                <NuxtImg src="/logo.jpeg" class="h-8 w-8 rounded-lg object-cover" />
              </div>
            </div>
            <div class="flex flex-col">
              <span
                class="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent"
                >SUTIT</span
              >
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden items-center space-x-1 lg:flex">
            <NuxtLink
              to="/"
              class="group hover:bg-accent/50 relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
              :class="
                $route.path === '/'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
              "
            >
              <span class="relative z-10">Home</span>
              <div
                class="from-primary/5 absolute inset-0 rounded-xl bg-gradient-to-r to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100"
              ></div>
            </NuxtLink>

            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                v-for="item in navItems"
                :key="item.href"
                :to="item.href"
                class="group hover:bg-accent/50 relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="
                  $route.path === item.href
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                "
              >
                <span class="relative z-10">{{ item.label }}</span>
                <div
                  class="from-primary/5 absolute inset-0 rounded-xl bg-gradient-to-r to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100"
                ></div>
              </NuxtLink>
            </template>

            <NuxtLink
              v-for="item in navs"
              :key="item.href"
              :to="item.href"
              class="group hover:bg-accent/50 relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
              :class="
                $route.path === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
              "
            >
              <span class="relative z-10">{{ item.label }}</span>
              <div
                class="from-primary/5 absolute inset-0 rounded-xl bg-gradient-to-r to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100"
              ></div>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-3">
          <!-- CTA Button for non-authenticated users -->
          <div v-if="!authStore.isAuthenticated" class="hidden items-center gap-3 md:flex">
            <NuxtLink to="/auth/login">
              <Button variant="ghost" class="hover:bg-accent/50 rounded-xl"> Log in </Button>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <Button
                class="from-primary hover:from-primary/90 group rounded-xl bg-gradient-to-r to-purple-600 shadow-lg transition-all duration-300 hover:to-purple-600/90 hover:shadow-xl"
              >
                <Sparkles class="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                Get Started
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </NuxtLink>
          </div>

          <!-- Theme Toggle -->
          <Button
            @click="toggleDark()"
            variant="outline"
            size="icon"
            class="border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all duration-200"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="!isDark" class="h-4 w-4 text-amber-500" />
            <Moon v-else class="h-4 w-4 text-blue-400" />
            <span class="sr-only">Toggle theme</span>
          </Button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="border-border/50 hover:border-primary/50 hover:bg-primary/5 h-11 w-11 rounded-xl transition-all duration-200"
                >
                  <div
                    class="from-primary flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br to-purple-600"
                  >
                    <span class="text-primary-foreground text-xs font-bold">
                      {{ authStore.user?.name?.charAt(0) || "U" }}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="border-border/50 w-64 rounded-xl shadow-xl">
                <div class="border-border/50 border-b px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="from-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-600 font-semibold"
                    >
                      {{ authStore.user?.name?.charAt(0) || "U" }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold">
                        {{ authStore.user?.name }}
                      </p>
                      <p class="text-muted-foreground truncate text-xs">
                        {{ authStore.user?.email }}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem as-child class="rounded-lg">
                  <a href="#" class="cursor-pointer">
                    <UserCircle class="mr-3 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child class="rounded-lg">
                  <NuxtLink to="/settings" class="cursor-pointer">
                    <Settings class="mr-3 h-4 w-4" />
                    Settings
                  </NuxtLink>
                </DropdownMenuItem>

                <DropdownMenuItem as-child class="rounded-lg">
                  <a href="#" class="cursor-pointer">
                    <HelpCircle class="mr-3 h-4 w-4" />
                    Support
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child class="rounded-lg">
                  <button
                    @click="logout"
                    class="text-destructive hover:text-destructive w-full cursor-pointer text-left"
                  >
                    <LogOut class="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Mobile Menu -->
          <Sheet v-model:open="mobileMenuOpen">
            <SheetTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all duration-200 lg:hidden"
              >
                <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
                <X v-else class="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" class="border-border/50 w-full rounded-b-2xl">
              <div class="mt-6 space-y-6">
                <!-- Mobile Auth Section -->
                <div v-if="!authStore.isAuthenticated" class="space-y-3">
                  <NuxtLink to="/auth/login" @click="mobileMenuOpen = false" class="block">
                    <Button variant="outline" class="w-full rounded-xl">Log in</Button>
                  </NuxtLink>
                  <NuxtLink to="/auth/register" @click="mobileMenuOpen = false" class="block">
                    <Button class="from-primary w-full rounded-xl bg-gradient-to-r to-purple-600">
                      <Sparkles class="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                  </NuxtLink>
                </div>

                <!-- Mobile Navigation -->
                <div class="grid grid-cols-2 gap-2">
                  <NuxtLink
                    to="/"
                    @click="mobileMenuOpen = false"
                    class="hover:bg-accent/50 rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200"
                    :class="
                      $route.path === '/'
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:text-primary'
                    "
                  >
                    Home
                  </NuxtLink>
                  <template v-if="authStore.isAuthenticated">
                    <NuxtLink
                      v-for="item in navItems"
                      :key="item.href"
                      :to="item.href"
                      @click="mobileMenuOpen = false"
                      class="hover:bg-accent/50 rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200"
                      :class="
                        $route.path === item.href
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:text-primary'
                      "
                    >
                      {{ item.label }}
                    </NuxtLink>
                  </template>
                  <NuxtLink
                    v-for="item in navs"
                    :key="item.href"
                    :to="item.href"
                    @click="mobileMenuOpen = false"
                    class="hover:bg-accent/50 rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200"
                    :class="
                      $route.path === item.href
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:text-primary'
                    "
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>

                <!-- Mobile User Section -->
                <div
                  v-if="authStore.isAuthenticated"
                  class="border-border/50 space-y-4 border-t pt-4"
                >
                  <div class="bg-accent/50 rounded-xl px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="from-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-600 font-semibold"
                      >
                        {{ authStore.user?.name?.charAt(0) || "U" }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold">
                          {{ authStore.user?.name }}
                        </p>
                        <p class="text-muted-foreground truncate text-xs">
                          {{ authStore.user?.email }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <UserCircle class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Profile</span> -->
                    <!-- </a> -->
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <Settings class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Settings</span> -->
                    <!-- </a> -->
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <HelpCircle class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Support</span> -->
                    <!-- </a> -->
                    <button
                      @click="
                        logout;
                        mobileMenuOpen = false;
                      "
                      class="hover:bg-destructive/10 text-destructive flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                    >
                      <LogOut class="h-4 w-4" />
                      <span class="font-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </nav>
</template>
