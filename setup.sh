#!/usr/bin/env bash

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "This script is for Linux only"
    exit 1
fi

if [ -n "$VERCEL" ] || [ -n "$NOW_REGION" ]; then
    echo "This script will not work on a serverless environment"
    exit 0
fi

if [[ $* == *--uninstall* ]]; then
    echo "Uninstalling Redis"
    sudo rm -rf /usr/local/bin/redis*
    sudo apt-get remove redis-server -y
    sudo apt-get purge redis-server -y
    sudo apt-get autoremove -y
    echo "Redis Uninstalled"
    exit 0
fi

function pre_check() {
    if [ -f /usr/local/bin/redis-server ]; then
        echo "Redis is already installed"
        exit 0
    fi

    if [ ! -d redis ]; then
        mkdir -p redis
    fi
}

function prerequisites() {
    sudo apt-get update
    sudo apt-get install libsystemd-dev -y
    sudo apt-get install build-essential tcl -y
}

function pull() {
    wget https://github.com/redis/redis/archive/7.2.3.tar.gz -O ./redis/7.2.3.tar.gz
    tar -xzf ./redis/7.2.3.tar.gz -C ./redis
}

function install() {
    cd redis/redis-7.2.3 || echo "Redis directory not found" && exit 1
    make
    sudo make install
    cd ../..
}

function add_on() {
  #sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget -y
  echo "Additional dependencies are disabled for now"
}

pre_check
prerequisites
pull
install