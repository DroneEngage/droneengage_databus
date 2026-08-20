const dgram = require('dgram');
const { EventEmitter } = require('events');
const AsyncLock = require('async-lock');

const { ANDRUAV_PROTOCOL_TARGET_ID, ANDRUAV_PROTOCOL_MESSAGE_TYPE, ANDRUAV_PROTOCOL_MESSAGE_CMD, INTERMODULE_ROUTING_TYPE, CMD_COMM_SYSTEM, CMD_COMM_GROUP, CMD_COMM_INDIVIDUAL, CMD_TYPE_INTERMODULE, JSON_INTERMODULE_MODULE_KEY, JSON_INTERMODULE_MODULE_ID, JSON_INTERMODULE_MODULE_CLASS, JSON_INTERMODULE_MODULE_MESSAGES_LIST, JSON_INTERMODULE_MODULE_FEATURES, JSON_INTERMODULE_HARDWARE_ID, JSON_INTERMODULE_HARDWARE_TYPE, JSON_INTERMODULE_VERSION, JSON_INTERMODULE_RESEND, JSON_INTERMODULE_TIMESTAMP_INSTANCE, JSON_INTERMODULE_PARTY_RECORD, TYPE_AndruavModule_ID, TYPE_AndruavMessage_DUMMY, ANDRUAV_PROTOCOL_SENDER_COMM_SERVER, ANDRUAV_PROTOCOL_SENDER, ANDRUAV_PROTOCOL_GROUP_ID } = require('./messages.js');
const { MODULE_FEATURE_RECEIVING_TELEMETRY, MODULE_FEATURE_SENDING_TELEMETRY, MODULE_FEATURE_CAPTURE_IMAGE, MODULE_FEATURE_CAPTURE_VIDEO, MODULE_FEATURE_GPIO, MODULE_FEATURE_AI_RECOGNITION, MODULE_FEATURE_TRACKING, MODULE_FEATURE_P2P, MODULE_CLASS_COMM, MODULE_CLASS_FCB, MODULE_CLASS_VIDEO, MODULE_CLASS_P2P, MODULE_CLASS_GENERIC, MODULE_CLASS_GPIO, MODULE_CLASS_A_RECOGNITION, MODULE_CLASS_TRACKING, MODULE_CLASS_VIEWLINK } = require('./messages.js');
const { SUCCESS_CONSOLE_BOLD_TEXT, SUCCESS_CONSOLE_TEXT, INFO_CONSOLE_TEXT, NORMAL_CONSOLE_TEXT } = require('./colors.js');
const CUDPClient = require('./udpClient');

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
        this.m_hardware_serial_type = 0;
        this.m_instance_time_stamp = Date.now();
        this.m_lock = new AsyncLock();
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
            [ANDRUAV_PROTOCOL_TARGET_ID]: ANDRUAV_PROTOCOL_SENDER_COMM_SERVER,
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
                [ANDRUAV_PROTOCOL_MESSAGE_TYPE]: TYPE_AndruavModule_RemoteExecute,
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
        // print(f"RX MSG: :len {len}:{message}");

        try {
            // The JSON header is always null-terminated; any binary payload (not
            // currently used by this module) would follow the null terminator.
            const null_index = message.indexOf(0);
            const json_part = (null_index !== -1) ? message.slice(0, null_index) : message;
            const jMsg = JSON.parse(json_part.toString());

            // print(f"RX MSG: jMsg{json.dumps(jMsg)}");

            if (!(ANDRUAV_PROTOCOL_MESSAGE_TYPE in jMsg) || !(INTERMODULE_ROUTING_TYPE in jMsg)) {
                return;
            }

            if (jMsg[INTERMODULE_ROUTING_TYPE] === CMD_TYPE_INTERMODULE) {
                /*
                    CMD_TYPE_INTERMODULE messages section.
                    These messages are sent by other modules to be consumed only
                    by modules and not to be sent outside DroneEngage unit.
                */
                if (!(ANDRUAV_PROTOCOL_MESSAGE_CMD in jMsg)) {
                    return;
                }

                const cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD];
                const message_type = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];

                if (message_type === TYPE_AndruavModule_ID) {
                    if (!(JSON_INTERMODULE_PARTY_RECORD in cmd)) {
                        return;
                    }
                    const moduleID = cmd[JSON_INTERMODULE_PARTY_RECORD];

                    if (!(ANDRUAV_PROTOCOL_SENDER in moduleID) || !(ANDRUAV_PROTOCOL_GROUP_ID in moduleID)) {
                        return;
                    }

                    this.m_party_id = moduleID[ANDRUAV_PROTOCOL_SENDER];
                    this.m_group_id = moduleID[ANDRUAV_PROTOCOL_GROUP_ID];

                    if (!this.m_FirstReceived) {
                        console.log(SUCCESS_CONSOLE_BOLD_TEXT + " ** Communicator Server Found: " + SUCCESS_CONSOLE_TEXT + "m_party_id(" + INFO_CONSOLE_TEXT + this.m_party_id + SUCCESS_CONSOLE_TEXT + ") m_group_id(" + INFO_CONSOLE_TEXT + this.m_group_id + SUCCESS_CONSOLE_TEXT + ")" + NORMAL_CONSOLE_TEXT);
                        this.createJSONID(false);
                        this.m_FirstReceived = true;
                    }

                    if (this.m_OnReceive) {
                        this.m_OnReceive(message, len, jMsg);
                    }
                    return;
                } else if (message_type === TYPE_AndruavMessage_DUMMY) {
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
        /*
        Create TYPE_AndruavModule_ID - JSON message
        This message is essential to identify module to de-Communicator.
        */

        const json_msg = {};
        json_msg[INTERMODULE_ROUTING_TYPE] = CMD_TYPE_INTERMODULE;
        json_msg[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = TYPE_AndruavModule_ID;

        const ms = {
            [JSON_INTERMODULE_MODULE_ID]: this.m_module_id,
            [JSON_INTERMODULE_MODULE_CLASS]: this.m_module_class,
            [JSON_INTERMODULE_MODULE_MESSAGES_LIST]: this.m_message_filter,
            [JSON_INTERMODULE_MODULE_FEATURES]: this.m_module_features,
            [JSON_INTERMODULE_MODULE_KEY]: this.m_module_key
        };

        // Only include hardware fields when a hardware serial has been set
        // (via setHardware). The C++ communicator enters its license-check
        // branch when JSON_INTERMODULE_HARDWARE_ID is present, and expects
        // JSON_INTERMODULE_HARDWARE_TYPE to be an int. Sending empty strings
        // here causes json.exception.type_error.302 on the C++ side.
        if (this.m_hardware_serial) {
            ms[JSON_INTERMODULE_HARDWARE_ID] = this.m_hardware_serial;
            ms[JSON_INTERMODULE_HARDWARE_TYPE] = this.m_hardware_serial_type;
        }
        ms[JSON_INTERMODULE_VERSION] = this.m_module_version;
        ms[JSON_INTERMODULE_RESEND] = reSend;
        ms[JSON_INTERMODULE_TIMESTAMP_INSTANCE] = this.m_instance_time_stamp;

        for (const [key, value] of Object.entries(this.m_stdinValues)) {
            ms[key] = value;
        }

        json_msg[ANDRUAV_PROTOCOL_MESSAGE_CMD] = ms;

        // Store the message into cUDPClient
        this.cUDPClient.setJsonId(JSON.stringify(json_msg));
    }
}

// Need TYPE_AndruavModule_RemoteExecute for sendMREMSG
const { TYPE_AndruavModule_RemoteExecute } = require('./messages.js');

module.exports = CModule;
