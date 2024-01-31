import {test, expect, beforeEach, afterEach} from "vitest";
import {LogFileWriter} from "../utils/classes";
import {execSync} from "node:child_process";
import * as fs from "node:fs";

beforeEach(() => {
    global.$FileLogger = new LogFileWriter()
})

afterEach(() => {
    $FileLogger.dispose()
})

test("Testing for $FileLogger", async () => {
    expect($FileLogger).toBeDefined()
    expect($FileLogger).toBeInstanceOf(LogFileWriter)
})

test("Testing for $FileLogger.log", async () => {
    const timestamp = new Date().toISOString()
    await $FileLogger.logString("Test " + timestamp)
    const content = execSync("tail ./logs/log.log").toString().split('\n').map(line => line.trim()).join('\n')
    expect(content).toContain("Test " + timestamp)
    execSync("sed -i '/Test " + timestamp + "/d' ./logs/log.log")
})

test("Testing for $FileLogger.tail", async () => {
    const timestamp = new Date().toISOString()
    const items = [
        {timestamp: timestamp, message: "Test Array 1"},
        {timestamp: timestamp, message: "Test Array 2"},
        {timestamp: timestamp, message: "Test Array 3"},
        {timestamp: timestamp, message: "Test Array 4"},
        {timestamp: timestamp, message: "Test Array 5"}
    ]

    for await (const item of items) {
        await $FileLogger.logString(item.message + " " + item.timestamp)
    }

    const logs = $FileLogger.tail("log", 5)
    expect(logs.length).toBe(5)

    logs.forEach((log, index) => {
        expect(log.args.join(" ")).toBe(items[index].message + " " + items[index].timestamp)
    })

    for (const item of items) {
        execSync("sed -i '/" + item.message + " " + item.timestamp + "/d' ./logs/log.log")
    }
})