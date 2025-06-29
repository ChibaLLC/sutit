import { createConsola, type LogObject, consola, type ConsolaReporter } from "consola";

export default async function createLogger({
  logger,
  logToConsole = true,
  environment = "client",
}: {
  logger?: Logger;
  logToConsole?: boolean;
  environment?: "server" | "client";
} = {}) {
  if (!logger) {
    logger = new Logger(undefined, {
      environment: environment,
    });
  }

  const reporters: ConsolaReporter[] = [
    {
      log: (logObj: LogObject) => {
        logger?.log(logObj);
      },
    },
  ];

  if (logToConsole) {
    reporters.push({
      log: (logObj: LogObject) => {
        const { type, ...rest } = logObj;
        const initial = consola.level;
        consola.level = rest.level;
        const log = rest.message ? [rest.message, ...rest.args] : rest.args;
        // @ts-expect-error
        consola[type](...log);
        consola.level = initial;
      },
    });
  }

  // TODO: add a reporter that sends logs to a remote server or any safe place
  // and another that emails fatal logs to the developer
  return createConsola({
    level: +999,
    reporters,
  });
}
