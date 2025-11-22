import { log } from "console";

export default defineEventHandler((event) => {
  log(`[${event.method}]  ${event.path}`);
});
