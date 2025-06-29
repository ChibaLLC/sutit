import createLogger from "@@/server/extra/consola";

declare global {
  var consola: Logger;
}

export default defineNitroPlugin(async () => {
  const logger = await createLogger();
  Object.defineProperty(global, "consola", {
    value: logger,
    writable: false,
    enumerable: true,
    configurable: false,
  });
});
