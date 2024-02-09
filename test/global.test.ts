import {test, expect, beforeEach} from "vitest";
import {Logger} from "../server/utils/classes";

beforeEach(() => {
    // @ts-ignore
    global.$FileLogger = new Logger()
})

test("Testing for $FileLogger", async () => {
    expect($Logger).toBeDefined()
    expect($Logger).toBeInstanceOf(Logger)
})