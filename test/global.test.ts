import {test, expect, beforeEach, afterEach} from "vitest";
import {LogFileWriter} from "../utils/classes";

beforeEach(() => {
    global.$FileLogger = new LogFileWriter()
})

test("Testing for $FileLogger", async () => {
    expect($FileLogger).toBeDefined()
    expect($FileLogger).toBeInstanceOf(LogFileWriter)
})