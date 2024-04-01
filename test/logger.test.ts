import {beforeEach, expect, test} from "vitest";
import {execSync} from "node:child_process";
import {Logger} from "../server/utils/logger";

beforeEach(() => {
    global.log = new Logger()
})

test("Testing for $FileLogger", async () => {
    expect(log).toBeDefined()
    expect(log).toBeInstanceOf(Logger)
})

test("Testing for $FileLogger.log", async () => {
    const timestamp = new Date().toISOString()
    await log.logString("Test " + timestamp)
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
        await log.logString(item.message + " " + item.timestamp)
    }

    const logs = log.tail("log", 5)
    expect(logs.length).toBe(5)

    logs.forEach((log, index) => {
        expect(log.args.join(" ")).toBe(items[index].message + " " + items[index].timestamp)
    })

    for (const item of items) {
        execSync("sed -i '/" + item.message + " " + item.timestamp + "/d' ./logs/log.log")
    }
})