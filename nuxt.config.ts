// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: false},
    nitro: {
        storage: {
            'redis': {
                driver: 'redis',
                base: "unstorage",
                host: process.env.REDIS_HOST ?? "localhost",
                tls: false as any,
                port: process.env.REDIS_PORT ?? 6379,
                password: process.env.REDIS_PASSWORD ?? undefined,
            },
            'file': {
                driver: 'fs',
                base: "./filestore"
            }
        },
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
        "@chiballc/nuxt-form-builder"
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