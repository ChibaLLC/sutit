import {test, expect, beforeEach} from "vitest";
import {LogFileWriter} from "../server/utils/classes";

beforeEach(() => {
    global.$FileLogger = new LogFileWriter()
})

test("Testing for $FileLogger", async () => {
    expect($FileLogger).toBeDefined()
    expect($FileLogger).toBeInstanceOf(LogFileWriter)
})