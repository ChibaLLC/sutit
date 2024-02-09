import { Client, LocalAuth } from "whatsapp-web.js";
import {toFile} from "qrcode";
import {test} from "vitest";

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "./whatsapp-web"
    })
});

test("should authenticate", async () => {
    client.on("qr", qr => {
        toFile("./qr.png", qr);
        console.log("QR code generated!");
    });

    client.on("ready", () => {
        console.log("Client is ready!");
    });

    client.on("message", message => {
        if (message.body === "ping") {
            message.reply("pong");
        } else if (message.body === "kill") {
            client.destroy();
        }
    })

   await client.initialize();
});