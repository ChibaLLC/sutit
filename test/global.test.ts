import {test, expect, beforeEach} from "vitest";
import {Logger} from "../server/utils/logger";

beforeEach(() => {
    global.log = new Logger()
})

test("Testing for $FileLogger", async () => {
    expect(log).toBeDefined()
    expect(log).toBeInstanceOf(Logger)
})