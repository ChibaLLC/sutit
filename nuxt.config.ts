// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ["~/assets/scss/main.scss"],
  modules: ["@chiballc/nuxt-form-builder", "@nuxt/scripts", "@nuxt/icon", "@pinia/nuxt"],
  runtimeConfig: {
    public: {
      // TODO: Replace  with best practices
      githubClientId: process.env.GITHUB_CLIENT_ID,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-06-28",
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  extends: ["github:kgarchie/nuxt-starter#6"],
});