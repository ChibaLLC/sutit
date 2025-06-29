import { isDevelopment } from "#build/types/nitro-imports";

export default defineNitroPlugin(() => {
  log.info(`Running in ${isDevelopment ? "development" : "production"} mode`);
});
