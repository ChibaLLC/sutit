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
    // "/": { prerender: true },
    // Disable prerendering to avoid xlsx bundling issues
  },
  nitro: {
    preset: "node-server",
    compressPublicAssets: true,
    minify: true,
  },
});
