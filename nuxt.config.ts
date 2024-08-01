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
        }
    },
    css: [
        '~/assets/scss/main.scss'
    ],
    modules: [
        "@nuxtjs/tailwindcss",
        "@chiballc/nuxt-form-builder"
    ],
    tailwindcss: {
        configPath: '~/tailwind.config.js',
    },
})