// @vitest-environment node
import { beforeAll, expect, test, afterEach, beforeEach } from "vitest";
import { Logger } from "@@/server/extra/logger";
import type { ConsolaInstance } from "consola";
import createLogger from "@@/server/extra/consola";

declare global {
  var consale: ConsolaInstance;
}

const logger = new Logger(undefined, {
  environment: "server",
});

beforeAll(async () => {
  global.consale = await createLogger({ logger: logger, logToConsole: false });
});

beforeEach(() => {
  expect(global.consale).toBeDefined();
});

afterEach(async () => {
  await logger.clear().catch(console.error);
});
test("should log a message and retrieve it with logger.tail", async () => {
  const timestamp = new Date().toISOString();
  global.consale.log("Test " + timestamp);

  // Wait for the logger to flush/write the log
  await new Promise((resolve) => setTimeout(resolve, 50));

  const result = logger.tail("log", 2);
  const content = result.at(0)?.args.join(" ");
  expect(content).toBeDefined();
  expect(content).toContain("Test " + timestamp);
});

test("should log multiple messages and retrieve them with logger.tail", async () => {
  const items = [
    { message: "Test Array 1" },
    { message: "Test Array 2" },
    { message: "Test Array 3" },
    { message: "Test Array 4" },
    { message: "Test Array 5" },
  ];

  for (const item of items) {
    global.consale.log(item.message);
  }

  // Wait for the logger to flush/write the logs
  await new Promise((resolve) => setTimeout(resolve, 50));

  const content = logger.tail("log", 5);
  expect(content).toHaveLength(5);
  items.forEach((item, idx) => {
    expect(content[idx]?.args.join(" ")).toContain(item.message);
  });
});
