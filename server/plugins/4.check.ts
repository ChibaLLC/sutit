import { isVercel, isDevelopment } from "../utils/env"

export default defineNitroPlugin(() => {
    log.box(`Running in ${isDevelopment ? "development" : "production"} mode`)
    if (isVercel) log.info("Running on Vercel")
})