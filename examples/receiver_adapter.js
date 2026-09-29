#!/usr/bin/env node
/**
 * DroneEngage Receiver Rate-Adapter (Node.js)
 * -------------------------------------------
 * Port of client/test/receiver_adapter.cpp
 *
 * Connects to de_comm, receives custom user-range messages from sender_adapter,
 * queues them, processes them at a configurable rate, and sends rate-control
 * feedback (slow down / speed up) back to the sender.
 *
 * Usage:
 *   node receiver_adapter.js <module_name> <de_comm_port> [delay_ms]
 *
 * Example:
 *   node receiver_adapter.js receiver_mod 60000 1000
 */

const path = require('path');

const libPath = path.resolve(__dirname, '..', 'nodejs');
const CModule = require(path.join(libPath, 'de_module'));
const colors = require(path.join(libPath, 'colors'));
const msg = require(path.join(libPath, 'messages'));

const {
    SUCCESS_CONSOLE_BOLD_TEXT, INFO_CONSOLE_BOLD_TEXT, INFO_CONSOLE_TEXT,
    TEXT_BOLD_HIGHTLITED, ERROR_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT
} = colors;

const {
    TYPE_AndruavMessage_USER_RANGE_START, ANDRUAV_PROTOCOL_MESSAGE_TYPE,
    MODULE_CLASS_GENERIC, MODULE_FEATURE_SENDING_TELEMETRY,
    MODULE_FEATURE_RECEIVING_TELEMETRY
} = msg;

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

const TYPE_CUSTOM_SOME_DATA    = TYPE_AndruavMessage_USER_RANGE_START + 0;
const TYPE_CUSTOM_CHANGE_RATE  = TYPE_AndruavMessage_USER_RANGE_START + 1;

const MESSAGE_FILTER = [TYPE_AndruavMessage_USER_RANGE_START];

let exitMe = false;
let delay = 1000;
let messagesInputCounter = 0;
let messagesProcessedCounter = 0;

const messageQueue = [];
const cModule = new CModule();

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function sendMsg(value) {
    const message = {
        t: 'CHANGE SPEED',
        processed: messagesProcessedCounter,
        value: value
    };
    cModule.sendJMSG('', message, TYPE_CUSTOM_CHANGE_RATE, true);
}

function processMessages() {
    console.log(INFO_CONSOLE_BOLD_TEXT + 'Check Queue ' + NORMAL_CONSOLE_TEXT);

    let counter = 0;
    let diff = 0;
    let iPid = 0;

    while (messageQueue.length > 0) {
        diff = messageQueue.length - counter + 1;
        counter = messageQueue.length;
        console.log(TEXT_BOLD_HIGHTLITED + 'PROCESS MESSAGE : ' + SUCCESS_CONSOLE_BOLD_TEXT + messagesProcessedCounter + NORMAL_CONSOLE_TEXT);
        console.log(TEXT_BOLD_HIGHTLITED + 'QUEUE : ' + SUCCESS_CONSOLE_BOLD_TEXT + counter + ' diff:' + SUCCESS_CONSOLE_BOLD_TEXT + diff + NORMAL_CONSOLE_TEXT);

        // Simulate processing time
        const start = Date.now();
        while (Date.now() - start < delay) { /* busy wait to match C++ sleep */ }

        messageQueue.shift();
        messagesProcessedCounter++;

        if (counter > 2 && diff > 0) {
            sendMsg(2 * counter); // send slower
            iPid = 0;
        } else {
            if (iPid > 100) iPid = 100;
        }
    }

    sendMsg(0); // send now
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + 'IDLE ' + NORMAL_CONSOLE_TEXT);
}

function onReceive(message, len, jMsg) {
    const msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];

    if (msgid === TYPE_CUSTOM_SOME_DATA) {
        messagesInputCounter++;

        console.log(SUCCESS_CONSOLE_BOLD_TEXT + 'MSG# ' + INFO_CONSOLE_TEXT + messagesInputCounter + SUCCESS_CONSOLE_BOLD_TEXT + ' >> QUEUE' + NORMAL_CONSOLE_TEXT);
        messageQueue.push(Buffer.from(message));
    }
}

function main() {
    process.on('SIGINT', () => { exitMe = true; });
    process.on('SIGTERM', () => { exitMe = true; });

    if (process.argv.length < 4) {
        console.error(INFO_CONSOLE_BOLD_TEXT
            + 'Insufficient arguments. Usage: node receiver_adapter.js <module_name> <de_comm_port> [delay_ms]'
            + NORMAL_CONSOLE_TEXT);
        process.exit(1);
    }

    const moduleName = process.argv[2];
    const targetPort = parseInt(process.argv[3]);
    if (process.argv.length >= 5) {
        delay = parseInt(process.argv[4]);
    }

    const moduleId = generateRandomModuleId();

    console.log(INFO_CONSOLE_TEXT + 'Receiver Rate-Adapter ' + NORMAL_CONSOLE_TEXT);

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        moduleName,
        moduleId,
        '0.0.1',
        MESSAGE_FILTER
    );

    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);

    cModule.setHardware('123456', 1); // HARDWARE_TYPE_CPU
    cModule.m_OnReceive = onReceive;

    cModule.init('127.0.0.1', targetPort, '0.0.0.0', 70024, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    console.log('RUNNING');

    const loop = setInterval(() => {
        if (exitMe) {
            clearInterval(loop);
            cModule.uninit();
            process.exit(0);
        }

        console.log('Receiver RUNNING');
        processMessages();
    }, 300);
}

main();
