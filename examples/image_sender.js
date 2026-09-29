#!/usr/bin/env node
/**
 * DroneEngage Image Sender (Node.js)
 * ----------------------------------
 * Port of client/test/image_sender.cpp
 *
 * Reads a binary file (e.g. img.jpeg) and sends it to the WebClient
 * via TYPE_AndruavMessage_IMG every 10 seconds using sendBMSG (binary).
 *
 * Usage:
 *   node image_sender.js <file_path> [de_comm_port] [listen_port]
 *
 * Defaults: de_comm_port=60000, listen_port=50000
 */

const path = require('path');
const fs = require('fs');

const libPath = path.resolve(__dirname, '..', 'nodejs');
const CModule = require(path.join(libPath, 'de_module'));
const colors = require(path.join(libPath, 'colors'));
const msg = require(path.join(libPath, 'messages'));

const {
    SUCCESS_CONSOLE_BOLD_TEXT, INFO_CONSOLE_BOLD_TEXT, INFO_CONSOLE_TEXT,
    NORMAL_CONSOLE_TEXT
} = colors;

const {
    TYPE_AndruavMessage_IMG, TYPE_AndruavMessage_DUMMY,
    MODULE_CLASS_GENERIC
} = msg;

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;
const MESSAGE_FILTER = [TYPE_AndruavMessage_IMG, TYPE_AndruavMessage_DUMMY];

let exitMe = false;
const cModule = new CModule();

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function getTimeUsec() {
    const [sec, nsec] = process.hrtime();
    return sec * 1000000 + Math.floor(nsec / 1000);
}

function main() {
    process.on('SIGINT', () => { exitMe = true; });
    process.on('SIGTERM', () => { exitMe = true; });

    const fileName = process.argv[2];
    const deCommPort = parseInt(process.argv[3] || '60000');
    const listenPort = parseInt(process.argv[4] || '50000');

    console.log(INFO_CONSOLE_BOLD_TEXT + 'This module can be used as follows:' + NORMAL_CONSOLE_TEXT);
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + '  node image_sender.js ./img.jpeg' + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_BOLD_TEXT + 'It will connect to a running DroneEngage communicator on port '
        + deCommPort + '.' + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_BOLD_TEXT + 'It will send the image to WebClient every 10 seconds.' + NORMAL_CONSOLE_TEXT);

    if (!fileName) {
        console.error(INFO_CONSOLE_BOLD_TEXT + 'Usage: node image_sender.js <file_path> [de_comm_port] [listen_port]' + NORMAL_CONSOLE_TEXT);
        process.exit(1);
    }

    let content;
    try {
        content = fs.readFileSync(fileName);
        console.log('Binary content read from file: ' + fileName + '  (' + content.length + ' bytes)');
    } catch (e) {
        console.error('Failed to open the file: ' + fileName);
        process.exit(1);
    }

    const moduleId = generateRandomModuleId();

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        'IMAGE_SENDER',
        'FSDR',
        '0.0.1',
        []  // WAITING FOR NO MESSAGES
    );

    // Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.setHardware('123456', 1); // HARDWARE_TYPE_CPU
    cModule.init('127.0.0.1', deCommPort, '0.0.0.0', listenPort, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    const loop = setInterval(() => {
        if (exitMe) {
            clearInterval(loop);
            cModule.uninit();
            process.exit(0);
        }

        console.log('WAITING');
        setTimeout(() => {
            console.log('Sending Image: length: ' + content.length);

            const msg_cmd = {
                lat: 0,
                lng: 0,
                alt: 0,
                tim: getTimeUsec()
            };

            cModule.sendBMSG('', content, content.length, TYPE_AndruavMessage_IMG, false, msg_cmd);
        }, 10000);
    }, 10000);
}

main();
