import {spawnSync, execSync} from "node:child_process";
import fs from "node:fs";

const OS = process.platform;

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
    return spawnSync(commandsArray.join(' && '), {shell: true});
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
            process.exit(0);
        }

        if (!fs.existsSync('redis')) {
            fs.mkdirSync('redis', {recursive: true});
        }
    },
    log_prerequisites: () => {
        console.log(colors.info, `Installing prerequisites`);
    },
    prerequisites: [
        'sudo apt install libsystemd-dev -y',
        'sudo apt-get update',
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
    install: [
        'cd ./redis/redis-7.2.3 && make MALLOC=libc USE_SYSTEMD=yes',
        'cd ./redis/redis-7.2.3 && sudo make install'
    ],
    clean: [
        'rm -rf ./redis'
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