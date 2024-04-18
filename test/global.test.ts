import {test, expect, beforeEach} from "vitest";
import {Logger} from "../server/utils/logger";
import {consola} from "consola";

beforeEach(() => {
    global.log = new Logger().logger
})

test("Testing for $FileLogger", async () => {
    expect(log).toBeDefined()
    expect(log).toBeInstanceOf(consola)
})