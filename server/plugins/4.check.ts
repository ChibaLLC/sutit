import { isVercel, isDevelopment } from "../utils/env"

export default defineNitroPlugin(() => {
    log.info(`Running in ${isDevelopment ? "development" : "production"} mode`)
})