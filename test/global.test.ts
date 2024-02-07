import {test, expect, beforeEach} from "vitest";
import {Logger} from "../server/utils/classes";

beforeEach(() => {
    global.$FileLogger = new Logger()
})

test("Testing for $FileLogger", async () => {
    expect($Logger).toBeDefined()
    expect($Logger).toBeInstanceOf(Logger)
})