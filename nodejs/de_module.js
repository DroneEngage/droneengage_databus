const dgram = require('dgram');
const { EventEmitter } = require('events');
const AsyncLock = require('async-lock');

const { ANDRUAV_PROTOCOL_TARGET_ID, ANDRUAV_PROTOCOL_MESSAGE_TYPE, ANDRUAV_PROTOCOL_MESSAGE_CMD, INTERMODULE_ROUTING_TYPE, CMD_COMM_SYSTEM, CMD_COMM_GROUP, CMD_COMM_INDIVIDUAL, CMD_TYPE_INTERMODULE, JSON_INTERMODULE_MODULE_KEY, JSON_INTERMODULE_MODULE_ID, JSON_INTERMODULE_MODULE_CLASS, JSON_INTERMODULE_MODULE_MESSAGES_LIST, JSON_INTERMODULE_MODULE_FEATURES, JSON_INTERMODULE_HARDWARE_ID, JSON_INTERMODULE_HARDWARE_TYPE, JSON_INTERMODULE_VERSION, JSON_INTERMODULE_RESEND, JSON_INTERMODULE_TIMESTAMP_INSTANCE, TYPE_AndruavModule_ID, TYPE_AndruavMessage_DUMMY, SPECIAL_NAME_SYS_NAME } = require('./messages.js'); // Adjust path as necessary
const CUDPClient = require('./udpClient'); // Adjust path as necessary

const MODULE_FEATURE_RECEIVING_TELEMETRY = "R";
const MODULE_FEATURE_SENDING_TELEMETRY = "T";
const MODULE_FEATURE_CAPTURE_IMAGE = "C";
const MODULE_FEATURE_CAPTURE_VIDEO = "V";

const MODULE_CLASS_COMM = "comm";
const MODULE_CLASS_FCB = "fcb";
const MODULE_CLASS_VIDEO = "camera";
const MODULE_CLASS_P2P = "p2p";
const MODULE_CLASS_GENERIC = "gen";

const HARDWARE_TYPE_UNDEFINED = 0;
const HARDWARE_TYPE_CPU = 1;

class CModule extends EventEmitter {
    constructor() {
        super();
        if (CModule._instance) {
            return CModule._instance;
        }
        CModule._instance = this;

        this.m_module_class = "";
        this.m_module_id = "";
        this.m_module_key = "";
        this.m_module_version = "";
        this.m_message_filter = {};
        this.cUDPClient = null;
        this.m_party_id = "";
        this.m_group_id = "";
        this.m_OnReceive = null;
        this.m_stdinValues = {};
        this.m_FirstReceived = false;
        this.m_module_features = [];
        this.m_hardware_serial = "";
        this.m_hardware_serial_type = "";
        this.m_instance_time_stamp = Date.now();
        this.m_lock = new AsyncLock(); // Use async-lock for reentrant locking
        return CModule._instance;
    }

    init(target_ip, broadcasts_port, host, listening_port, chunk_size) {
        this.cUDPClient = new CUDPClient();
        this.cUDPClient.init(target_ip, broadcasts_port, host, listening_port, chunk_size, this.onReceive.bind(this));
        this.createJSONID(true);
        this.cUDPClient.start();
        return true;
    }

    uninit() {
        this.cUDPClient.stop();
        return true;
    }

    defineModule(module_class, module_id, module_key, module_version, message_filter) {
        this.m_module_class = module_class;
        this.m_module_id = module_id;
        this.m_module_key = module_key;
        this.m_module_version = module_version;
        this.m_message_filter = message_filter;
    }

    addModuleFeatures(feature) {
        this.m_module_features.push(feature);
    }

    setHardware(hardware_serial, hardware_serial_type) {
        this.m_hardware_serial = hardware_serial;
        this.m_hardware_serial_type = hardware_serial_type;
    }

    sendMSG(msg, length) {
        this.cUDPClient.sendMSG(msg, length);
    }

    sendSysMsg(jmsg, andruav_message_id) {
        const full_message = {
            [ANDRUAV_PROTOCOL_TARGET_ID]: SPECIAL_NAME_SYS_NAME,
            [INTERMODULE_ROUTING_TYPE]: CMD_COMM_SYSTEM,
            [ANDRUAV_PROTOCOL_MESSAGE_TYPE]: andruav_message_id,
            [ANDRUAV_PROTOCOL_MESSAGE_CMD]: jmsg
        };
        const msg = JSON.stringify(full_message);
        this.sendMSG(Buffer.from(msg), msg.length);
    }

    sendJMSG(targetPartyID, jmsg, andruav_message_id, internal_message) {
        this.m_lock.acquire('lock', (done) => {
            const fullMessage = {};
            let msg_routing_type = CMD_COMM_GROUP;

            if (internal_message) {
                msg_routing_type = CMD_TYPE_INTERMODULE;
            } else if (targetPartyID) {
                msg_routing_type = CMD_COMM_INDIVIDUAL;
            }

            fullMessage[JSON_INTERMODULE_MODULE_KEY] = this.m_module_key;
            fullMessage[ANDRUAV_PROTOCOL_TARGET_ID] = targetPartyID;
            fullMessage[INTERMODULE_ROUTING_TYPE] = msg_routing_type;
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = andruav_message_id;
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD] = jmsg;

            const msg = JSON.stringify(fullMessage);
            console.log(`sendJMSG: ${msg}`);
            this.sendMSG(Buffer.from(msg), msg.length);
            done();
        });
    }

    sendBMSG(targetPartyID, bmsg, bmsg_length, andruav_message_id, internal_message, message_cmd) {
        this.m_lock.acquire('lock', (done) => {
            const fullMessage = {};
            let msg_routing_type = CMD_COMM_GROUP;

            if (internal_message) {
                msg_routing_type = CMD_TYPE_INTERMODULE;
            } else if (targetPartyID) {
                msg_routing_type = CMD_COMM_INDIVIDUAL;
            }

            fullMessage[JSON_INTERMODULE_MODULE_KEY] = this.m_module_key;
            fullMessage[ANDRUAV_PROTOCOL_TARGET_ID] = targetPartyID;
            fullMessage[INTERMODULE_ROUTING_TYPE] = msg_routing_type;
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = andruav_message_id;
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD] = message_cmd;

            const json_msg = JSON.stringify(fullMessage);
            let msg = Buffer.from(json_msg + '\0');

            if (bmsg_length) {
                msg = Buffer.concat([msg, bmsg]);
            }

            this.sendMSG(msg, msg.length);
            done();
        });
    }

    sendMREMSG(command_type) {
        this.m_lock.acquire('lock', (done) => {
            const json_msg = {
                [JSON_INTERMODULE_MODULE_KEY]: this.m_module_key,
                [INTERMODULE_ROUTING_TYPE]: CMD_TYPE_INTERMODULE,
                [ANDRUAV_PROTOCOL_MESSAGE_TYPE]: "TYPE_AndruavModule_RemoteExecute",
                [ANDRUAV_PROTOCOL_MESSAGE_CMD]: { "C": command_type }
            };

            const msg = JSON.stringify(json_msg);
            this.sendMSG(Buffer.from(msg), msg.length);
            done();
        });
    }

    forwardMSG(message, datalength) {
        this.sendMSG(message, datalength);
    }

    onReceive(message, len) {
        console.log(`RX MSG: len ${len}: ${message}`);

        try {
            const jMsg = JSON.parse(message.toString());

            console.log(`RX MSG: jMsg ${JSON.stringify(jMsg)}`);

            if (!(ANDRUAV_PROTOCOL_MESSAGE_TYPE in jMsg) || !(INTERMODULE_ROUTING_TYPE in jMsg)) {
                return;
            }

            if (jMsg[INTERMODULE_ROUTING_TYPE] === CMD_TYPE_INTERMODULE) {
                if (!(ANDRUAV_PROTOCOL_MESSAGE_CMD in jMsg)) {
                    return;
                }

                const cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD];
                const messageType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];

                if (messageType === TYPE_AndruavModule_ID) {
                    const moduleID = cmd["f"];
                    if (!("f" in cmd) || !(ANDRUAV_PROTOCOL_SENDER in moduleID) || !(ANDRUAV_PROTOCOL_GROUP_ID in moduleID)) {
                        return;
                    }

                    this.m_party_id = moduleID[ANDRUAV_PROTOCOL_SENDER];
                    this.m_group_id = moduleID[ANDRUAV_PROTOCOL_GROUP_ID];

                    if (!this.m_FirstReceived) {
                        console.log(` ** Communicator Server Found: m_party_id(${this.m_party_id}) m_group_id(${this.m_group_id})`);
                        this.createJSONID(false);
                        this.m_FirstReceived = true;
                    }

                    if (this.m_OnReceive) {
                        this.m_OnReceive(message, len, jMsg);
                    }
                    return;
                } else if (messageType === TYPE_AndruavMessage_DUMMY) {
                    console.log(` TYPE_AndruavMessage_DUMMY ${message}`);
                }
            }

            if (this.m_OnReceive) {
                this.m_OnReceive(message, len, jMsg);
            }

        } catch (e) {
            console.error(`ERROR: ${e}`);
        }
    }

    appendExtraField(name, ms) {
        this.m_stdinValues[name] = ms;
    }

    createJSONID(reSend) {
        const json_msg = {};
        json_msg[INTERMODULE_ROUTING_TYPE] = CMD_TYPE_INTERMODULE;
        json_msg[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = TYPE_AndruavModule_ID;

        const ms = {
            [JSON_INTERMODULE_MODULE_ID]: this.m_module_id,
            [JSON_INTERMODULE_MODULE_CLASS]: this.m_module_class,
            [JSON_INTERMODULE_MODULE_MESSAGES_LIST]: this.m_message_filter,
            [JSON_INTERMODULE_MODULE_FEATURES]: this.m_module_features,
            [JSON_INTERMODULE_MODULE_KEY]: this.m_module_key,
            [JSON_INTERMODULE_HARDWARE_ID]: this.m_hardware_serial,
            [JSON_INTERMODULE_HARDWARE_TYPE]: this.m_hardware_serial_type,
            [JSON_INTERMODULE_VERSION]: this.m_module_version,
            [JSON_INTERMODULE_RESEND]: reSend,
            [JSON_INTERMODULE_TIMESTAMP_INSTANCE]: this.m_instance_time_stamp
        };

        for (const [key, value] of Object.entries(this.m_stdinValues)) {
            ms[key] = value;
        }

        json_msg[ANDRUAV_PROTOCOL_MESSAGE_CMD] = ms;

        this.cUDPClient.setJsonId(JSON.stringify(json_msg));
    }
}

module.exports = CModule;
