#!/usr/bin/env node
/**
 * DroneEngage MAVLink Listener (Node.js)
 * --------------------------------------
 * Port of client/test/mavlink_listener.cpp
 *
 * Connects to a running de_comm, subscribes to MAVLink messages,
 * and prints every received MAVLink message (JSON header + binary payload).
 *
 * Usage:
 *   node mavlink_listener.js [de_comm_port] [listen_port]
 *
 * Defaults: de_comm_port=60000, listen_port=70014
 */

const path = require('path');
const fs = require('fs');

// Add the nodejs lib to the require path
const libPath = path.resolve(__dirname, '..', 'nodejs');
const CModule = require(path.join(libPath, 'de_module'));
const { CFacade_Base } = require(path.join(libPath, 'de_facade_base'));
const colors = require(path.join(libPath, 'colors'));
const msg = require(path.join(libPath, 'messages'));

const {
    SUCCESS_CONSOLE_BOLD_TEXT, SUCCESS_CONSOLE_TEXT, INFO_CONSOLE_TEXT,
    INFO_CONSOLE_BOLD_TEXT, LOG_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT
} = colors;

const {
    TYPE_AndruavMessage_RemoteExecute, TYPE_AndruavMessage_FlightControl,
    TYPE_AndruavMessage_GeoFence, TYPE_AndruavMessage_ExternalGeoFence,
    TYPE_AndruavMessage_Arm, TYPE_AndruavMessage_ChangeAltitude,
    TYPE_AndruavMessage_Land, TYPE_AndruavMessage_GuidedPoint,
    TYPE_AndruavMessage_CirclePoint, TYPE_AndruavMessage_DoYAW,
    TYPE_AndruavMessage_DistinationLocation, TYPE_AndruavMessage_ChangeSpeed,
    TYPE_AndruavMessage_TrackingTarget_ACTION, TYPE_AndruavMessage_TrackingTargetLocation,
    TYPE_AndruavMessage_TrackingTarget_STATUS, TYPE_AndruavMessage_UploadWayPoints,
    TYPE_AndruavMessage_RemoteControlSettings, TYPE_AndruavMessage_SET_HOME_LOCATION,
    TYPE_AndruavMessage_RemoteControl2, TYPE_AndruavMessage_LightTelemetry,
    TYPE_AndruavMessage_ServoChannel, TYPE_AndruavMessage_Sync_EventFire,
    TYPE_AndruavMessage_MAVLINK, TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_Make_Swarm, TYPE_AndruavMessage_FollowHim_Request,
    TYPE_AndruavMessage_FollowMe_Guided, TYPE_AndruavMessage_UpdateSwarm,
    TYPE_AndruavMessage_UDPProxy_Info, TYPE_AndruavSystem_UDPProxy,
    TYPE_AndruavMessage_P2P_ACTION, TYPE_AndruavMessage_P2P_STATUS,
    TYPE_AndruavMessage_ID, ANDRUAV_PROTOCOL_MESSAGE_TYPE, ANDRUAV_PROTOCOL_MESSAGE_CMD,
    ANDRUAV_PROTOCOL_SENDER, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO,
    MODULE_CLASS_GENERIC, MODULE_FEATURE_SENDING_TELEMETRY, MODULE_FEATURE_RECEIVING_TELEMETRY
} = msg;

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

const MESSAGE_FILTER = [
    TYPE_AndruavMessage_RemoteExecute,
    TYPE_AndruavMessage_FlightControl,
    TYPE_AndruavMessage_GeoFence,
    TYPE_AndruavMessage_ExternalGeoFence,
    TYPE_AndruavMessage_Arm,
    TYPE_AndruavMessage_ChangeAltitude,
    TYPE_AndruavMessage_Land,
    TYPE_AndruavMessage_GuidedPoint,
    TYPE_AndruavMessage_CirclePoint,
    TYPE_AndruavMessage_DoYAW,
    TYPE_AndruavMessage_DistinationLocation,
    TYPE_AndruavMessage_ChangeSpeed,
    TYPE_AndruavMessage_TrackingTarget_ACTION,
    TYPE_AndruavMessage_TrackingTargetLocation,
    TYPE_AndruavMessage_TrackingTarget_STATUS,
    TYPE_AndruavMessage_UploadWayPoints,
    TYPE_AndruavMessage_RemoteControlSettings,
    TYPE_AndruavMessage_SET_HOME_LOCATION,
    TYPE_AndruavMessage_RemoteControl2,
    TYPE_AndruavMessage_LightTelemetry,
    TYPE_AndruavMessage_ServoChannel,
    TYPE_AndruavMessage_Sync_EventFire,
    TYPE_AndruavMessage_MAVLINK,
    TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_Make_Swarm,
    TYPE_AndruavMessage_FollowHim_Request,
    TYPE_AndruavMessage_FollowMe_Guided,
    TYPE_AndruavMessage_UpdateSwarm,
    TYPE_AndruavMessage_UDPProxy_Info,
    TYPE_AndruavSystem_UDPProxy,
    TYPE_AndruavMessage_P2P_ACTION,
    TYPE_AndruavMessage_P2P_STATUS
];

let exitMe = false;
const cModule = new CModule();
const facade = new CFacade_Base(cModule);

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function onReceive(message, len, jMsg) {
    const messageType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];

    // Skip the module ID handshake (handled by CModule already)
    if (messageType === TYPE_AndruavMessage_ID) {
        return;
    }

    // MAVLink messages are binary: JSON header + null terminator + raw bytes
    const nullIndex = message.indexOf(0);
    let binaryPayload = Buffer.alloc(0);
    if (nullIndex !== -1 && nullIndex + 1 < message.length) {
        binaryPayload = message.slice(nullIndex + 1);
    }

    const sender = jMsg[ANDRUAV_PROTOCOL_SENDER] || '?';
    const cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD] || {};

    console.log(LOG_CONSOLE_BOLD_TEXT
        + `RX MAVLINK  type=${messageType}  sender=${sender}`
        + INFO_CONSOLE_TEXT
        + `  json_cmd=${JSON.stringify(cmd)}`
        + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_TEXT
        + `  binary: ${binaryPayload.length} bytes  hex=${binaryPayload.toString('hex')}`
        + NORMAL_CONSOLE_TEXT);
}

function main() {
    process.on('SIGINT', () => { exitMe = true; });
    process.on('SIGTERM', () => { exitMe = true; });

    const deCommPort = parseInt(process.argv[2] || '60000');
    const listenPort = parseInt(process.argv[3] || '70014');

    console.log(INFO_CONSOLE_BOLD_TEXT
        + 'This module will subscribe in DroneEngage that runs on port '
        + deCommPort + '.' + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_BOLD_TEXT
        + 'It will receive mavlink messages sent by the mavlink module.'
        + NORMAL_CONSOLE_TEXT);

    const moduleId = generateRandomModuleId();

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        'MAV-LST',
        'mav27e099d91de',
        '0.0.1',
        MESSAGE_FILTER
    );

    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);

    cModule.setHardware('123456', 1); // HARDWARE_TYPE_CPU
    cModule.m_OnReceive = onReceive;

    cModule.init('127.0.0.1', deCommPort, '0.0.0.0', listenPort, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    facade.sendErrorMessage('', 0, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO, 'Hello World mavlink_listener.');

    console.log(SUCCESS_CONSOLE_TEXT + 'RUNNING' + NORMAL_CONSOLE_TEXT);

    const loop = setInterval(() => {
        if (exitMe) {
            clearInterval(loop);
            cModule.uninit();
            console.log(SUCCESS_CONSOLE_BOLD_TEXT + 'EXIT' + NORMAL_CONSOLE_TEXT);
            process.exit(0);
        }
        console.log('RUNNING');
    }, 1000);
}

main();
