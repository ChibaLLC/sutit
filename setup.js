import { spawnSync, execSync } from "node:child_process";
import fs from "node:fs";

const OS = process.platform;

if (process.env.NODE_ENV== 'dev' && process.env.NODE_ENV !== 'development') {
    console.log("This script is only for development purposes");
    process.exit(0);
}

const colors = {
    green: "\x1b[32msuccess:\x1b[0m",
    red: "\x1b[31merror:\x1b[0m",
    info: "\x1b[34minfo:\x1b[0m",
    warning: "\x1b[33mwarning:\x1b[0m",
}

for (let arg of process.argv.slice(2)) {
    switch (arg) {
        case '--uninstall':
            uninstall();
            console.log(colors.green, `Redis uninstalled`);
            process.exit(0);
            break;
        default:
            break
    }
}

function spawner(commandsArray) {
    for (const command of commandsArray) {
        const result = spawnSync(command, { shell: true, stdio: 'inherit' });
        if (result.error) {
            console.error(colors.red, `Error executing command: ${command}`);
            console.error(result.error);
            process.exit(1);
        }
    }
}


const order = {
    pre_check: () => {
        if (OS !== 'linux') {
            console.log(colors.warning, "Redis is not supported on this OS; WebApp will use file storage instead");
            process.exit(0);
        } else {
            console.log(colors.green, `Installing Redis on Linux`);
        }

        if (fs.existsSync('/usr/local/bin/redis-server')) {
            console.log(colors.info, `Redis is already installed`);
            spawner(order.add_on)
            process.exit(0);
        }

        if (!fs.existsSync('redis')) {
            fs.mkdirSync('redis', { recursive: true });
        }
    },
    log_prerequisites: () => {
        console.log(colors.info, `Installing prerequisites`);
    },
    prerequisites: [
        'sudo apt-get update',
        'sudo apt install libsystemd-dev -y',
        'sudo apt-get install build-essential tcl -y'
    ],
    log_download: () => {
        console.log(colors.info, `Downloading Redis`);
    },
    pull: [
        'wget https://github.com/redis/redis/archive/7.2.3.tar.gz -O ./redis/7.2.3.tar.gz',
        'tar xzf ./redis/7.2.3.tar.gz -C ./redis'
    ],
    log_install: () => {
        console.log(colors.info, `Installing Redis`);
    },
    install: [ // incase the make below fails, use `make MALLOC=libc USE_SYSTEMD=yes`
        'cd ./redis/redis-7.2.3 && make',
        'cd ./redis/redis-7.2.3 && sudo make install'
    ],
    clean: [
        'rm -rf ./redis'
    ],
    log_add_on: () => {
        console.log(colors.info, `Adding Redis to system path`);
    },
    add_on: [
        'sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget -y'
    ]
}

for (let item of Object.keys(order)) {
    console.log(colors.info, `Running ${item}`);
    if (typeof order[item] === "function") {
        order[item]();
    } else if (Array.isArray(order[item])) {
        spawner(order[item]);
    } else {
        console.log(colors.warning, `Unknown command: ${item}`);
    }
}

/**
 * This function uninstalls Redis from the system
 */
function uninstall() {
    console.log(colors.info, `Uninstalling Redis`);
    execSync(`sudo rm -rf /usr/local/bin/redis*`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
}