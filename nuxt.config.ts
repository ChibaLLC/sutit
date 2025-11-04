import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
  ],
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./app/components/ui",
  },
  runtimeConfig: {
    public: {
      publicUrl: "",
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/about": { prerender: true },
    "/contact": { prerender: true },
    "/templates": { prerender: true },
    // "/marketplace": { prerender: true },
  },
  site: {},
  robots: {},
  image: {
    format: ["webp", "avif", "png", "jpg", "jpeg"],
    quality: 80,
    sizes: "320,640,768,1024,1280,1536",
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  nitro: {
    preset: "node-server",
    compressPublicAssets: true,
    minify: true,
    experimental: {
      wasm: true,
    },
    prerender: {
      routes: ["/sitemap.xml"],
    },
  },
});
