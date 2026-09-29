const { TYPE_AndruavMessage_ID, TYPE_AndruavMessage_RemoteExecute, TYPE_AndruavMessage_Error, TYPE_AndruavMessage_CONFIG_STATUS, CONFIG_STATUS_FETCH_CONFIG_TEMPLATE } = require('./messages');
const { SUCCESS_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT } = require('./colors');

class CFacade_Base {
    constructor(m_module) {
        this.m_module = m_module;
    }

    requestID(target_party_id) {
        const message = {
            C: TYPE_AndruavMessage_ID
        };

        this.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_RemoteExecute, true);
    }

    sendErrorMessage(target_party_id, error_number, info_type, notification_type, description) {
        /**
         * EN: error number "not currently processed".
         * IT: info type indicate what component is reporting the error.
         * NT: severity and compliant with ardupilot.
         * DS: description message.
         */
        const message = {
            EN: error_number,
            IT: info_type,
            NT: notification_type,
            DS: description
        };

        this.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_Error, false);

        console.log(`\n${SUCCESS_CONSOLE_BOLD_TEXT} -- sendErrorMessage ${NORMAL_CONSOLE_TEXT}${description}`);
    }

    API_sendConfigTemplate(target_party_id, module_key, json_file_content_json, reply) {
        const message = {
            "a": CONFIG_STATUS_FETCH_CONFIG_TEMPLATE,
            "b": json_file_content_json,
            "k": module_key,
            "R": reply
        };

        this.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_CONFIG_STATUS, false);
    }
}

class MyFacade extends CFacade_Base {
    constructor(m_module) {
        super(m_module);
    }

    // Add your custom methods here
    my_custom_method(arg1, arg2) {
        // Implement your custom method here
    }
}

module.exports = { CFacade_Base, MyFacade, CMyFacade: MyFacade };
