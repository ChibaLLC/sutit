// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: false},
    nitro: {
        experimental: {
            websocket: true
        },
        imports: {
            dirs: [
                "./shared/utils",
                "./shared/types"
            ]
        }
    },
    css: [
        '~/assets/scss/main.scss'
    ],
    modules: [
      "@nuxtjs/tailwindcss",
      "@chiballc/nuxt-form-builder",
      "@nuxt/scripts"
    ],
    runtimeConfig: {
        public: {
            githubClientId: process.env.GITHUB_CLIENT_ID,
            googleClientId: process.env.GOOGLE_CLIENT_ID
        }
    },
    future: {
        compatibilityVersion: 4
    },
    imports: {
        dirs: [
            "../shared/types",
            "../shared/utils"
        ]
    },
    compatibilityDate: "2024-11-09"
})