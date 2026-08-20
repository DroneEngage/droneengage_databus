#!/usr/bin/env node
/**
 * DroneEngage Sender Rate-Adapter (Node.js)
 * -----------------------------------------
 * Port of client/test/sender_adapter.cpp
 *
 * Connects to de_comm and sends custom user-range messages at a configurable
 * rate. Listens for rate-control feedback from receiver_adapter and adjusts
 * its sending delay accordingly.
 *
 * Usage:
 *   node sender_adapter.js <module_name> <de_comm_port> [rate_ms]
 *
 * Example:
 *   node sender_adapter.js sender_mod 60000 1000
 */

const path = require('path');

const libPath = path.resolve(__dirname, '..', 'nodejs');
const CModule = require(path.join(libPath, 'de_module'));
const colors = require(path.join(libPath, 'colors'));
const msg = require(path.join(libPath, 'messages'));

const {
    SUCCESS_CONSOLE_BOLD_TEXT, INFO_CONSOLE_BOLD_TEXT, INFO_CONSOLE_TEXT,
    LOG_CONSOLE_TEXT, LOG_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT,
    TEXT_BOLD_HIGHTLITED
} = colors;

const {
    TYPE_AndruavMessage_USER_RANGE_START, ANDRUAV_PROTOCOL_MESSAGE_TYPE,
    ANDRUAV_PROTOCOL_MESSAGE_CMD, MODULE_CLASS_GENERIC,
    MODULE_FEATURE_SENDING_TELEMETRY, MODULE_FEATURE_RECEIVING_TELEMETRY
} = msg;

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

const TYPE_CUSTOM_SOME_DATA    = TYPE_AndruavMessage_USER_RANGE_START + 0;
const TYPE_CUSTOM_CHANGE_RATE  = TYPE_AndruavMessage_USER_RANGE_START + 1;

const MESSAGE_FILTER = [
    TYPE_AndruavMessage_USER_RANGE_START + 1,
    TYPE_AndruavMessage_USER_RANGE_START + 2
];

let exitMe = false;
let delay = 1000;
let counter = 0;
let oldNow = Date.now();

const cModule = new CModule();

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function sendMsg() {
    const message = {
        t: 'SENDING DATA',
        counter: counter
    };
    counter++;
    cModule.sendJMSG('', message, TYPE_AndruavMessage_USER_RANGE_START, true);
}

function onReceive(message, len, jMsg) {
    const msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];

    if (msgid === TYPE_CUSTOM_CHANGE_RATE) {
        const cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD] || {};
        const deltaDelay = cmd.value || 0;
        console.log(LOG_CONSOLE_BOLD_TEXT + 'delta_delay:' + INFO_CONSOLE_TEXT + deltaDelay + NORMAL_CONSOLE_TEXT);

        if (deltaDelay === 0) {
            delay = Math.floor(delay / 2);
            sendMsg();
            return;
        } else {
            delay += deltaDelay;
        }

        if (delay < 10) {
            delay = 10;
        }
    }
}

function main() {
    process.on('SIGINT', () => { exitMe = true; });
    process.on('SIGTERM', () => { exitMe = true; });

    if (process.argv.length < 4) {
        console.error(INFO_CONSOLE_BOLD_TEXT
            + 'Insufficient arguments. Usage: node sender_adapter.js <module_name> <de_comm_port> [rate_ms]'
            + NORMAL_CONSOLE_TEXT);
        process.exit(1);
    }

    const moduleName = process.argv[2];
    const targetPort = parseInt(process.argv[3]);
    if (process.argv.length >= 5) {
        delay = parseInt(process.argv[4]);
    }

    const moduleId = generateRandomModuleId();

    console.log(SUCCESS_CONSOLE_BOLD_TEXT + 'SENDING Rate-Adapter ' + NORMAL_CONSOLE_TEXT);

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

    cModule.init('127.0.0.1', targetPort, '0.0.0.0', 70034, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    console.log('RUNNING');

    const loop = setInterval(() => {
        if (exitMe) {
            clearInterval(loop);
            cModule.uninit();
            process.exit(0);
        }

        const now = Date.now();
        if (now - oldNow > delay) {
            console.log(LOG_CONSOLE_TEXT + 'Next Message in ' + INFO_CONSOLE_TEXT + delay + LOG_CONSOLE_TEXT + ' ms' + NORMAL_CONSOLE_TEXT);
            oldNow = now;
            console.log(TEXT_BOLD_HIGHTLITED + 'SENDING MESSAGE NUMBER:' + SUCCESS_CONSOLE_BOLD_TEXT + counter + NORMAL_CONSOLE_TEXT);
            sendMsg();
        }
    }, 10);
}

main();
