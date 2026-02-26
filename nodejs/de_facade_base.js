const { TYPE_AndruavMessage_ID, TYPE_AndruavMessage_RemoteExecute, TYPE_AndruavMessage_Error, TYPE_AndruavMessage_CONFIG_STATUS, CONFIG_STATUS_FETCH_CONFIG_TEMPLATE } = require('./messages'); // Adjust path as necessary
const { SUCCESS_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT, INFO_CONSOLE_TEXT } = require('./colors'); // Adjust path as necessary

class CFacade_Base {
    constructor() {
        if (CFacade_Base._instance) {
            return CFacade_Base._instance;
        }
        this.m_module = null; // Will be set by subclass or injection
        CFacade_Base._instance = this;
    }

    static getInstance() {
        if (!CFacade_Base._instance) {
            CFacade_Base._instance = new CFacade_Base();
        }
        return CFacade_Base._instance;
    }

    setModule(module) {
        this.m_module = module;
    }

    requestID(targetPartyID) {
        const message = {
            C: TYPE_AndruavMessage_ID
        };

        if (this.m_module) {
            this.m_module.sendJMSG(targetPartyID, message, TYPE_AndruavMessage_RemoteExecute, true);
        }
    }

    sendErrorMessage(targetPartyID, errorNumber, infoType, notificationType, description) {
        /**
         * EN: error number "not currently processed".
         * IT: info type indicates what component is reporting the error.
         * NT: severity and compliant with ardupilot.
         * DS: description message.
         */
        const message = {
            EN: errorNumber,
            IT: infoType,
            NT: notificationType,
            DS: description
        };

        if (this.m_module) {
            this.m_module.sendJMSG(targetPartyID, message, TYPE_AndruavMessage_Error, false);
        }

        console.log(`\n${SUCCESS_CONSOLE_BOLD_TEXT} -- sendErrorMessage ${NORMAL_CONSOLE_TEXT}${description}`);
    }

    API_sendConfigTemplate(target_party_id, module_key, json_file_content_json, reply) {
        // Create JSON message
        const message = {
            "a": CONFIG_STATUS_FETCH_CONFIG_TEMPLATE,
            "b": json_file_content_json,
            "k": module_key,
            "R": reply
        };

        // Send command
        if (this.m_module) {
            this.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_CONFIG_STATUS, false);
        }

        console.log(`\n${INFO_CONSOLE_TEXT}API_sendConfigTemplate: module_key:${module_key}${NORMAL_CONSOLE_TEXT}`);
        console.log(`\n${INFO_CONSOLE_TEXT}API_sendConfigTemplate: json_file_content_json:${JSON.stringify(json_file_content_json)}${NORMAL_CONSOLE_TEXT}`);

        return;
    }
}

module.exports = { CFacade_Base };