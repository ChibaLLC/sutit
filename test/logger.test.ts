import {beforeAll, expect, test} from "vitest";
import {execSync} from "node:child_process";
import {Logger} from "../server/utils/logger";
import {consola} from 'consola';

beforeAll(() => {
    global.log = new Logger().logger
})

test("Testing for $FileLogger", async () => {
    expect(log).toBeDefined()
    expect(log).toBeInstanceOf(consola)
})

test("Testing for $FileLogger.log", async () => {
    const timestamp = new Date().toISOString()
    log.log("Test " + timestamp)
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

    for (const item of items) {
        log.log(item.message + " " + item.timestamp)
    }

    const logs = new Logger().tail("log", 5)
    expect(logs.length).toBe(5)

    logs.forEach((log, index) => {
        expect(log.args.join(" ")).toBe(items[index].message + " " + items[index].timestamp)
    })

    for (const item of items) {
        execSync("sed -i '/" + item.message + " " + item.timestamp + "/d' ./logs/log.log")
    }
})