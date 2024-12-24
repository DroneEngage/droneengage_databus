const { TYPE_AndruavMessage_ID, TYPE_AndruavMessage_RemoteExecute, TYPE_AndruavMessage_Error } = require('./messages'); // Adjust path as necessary
const { SUCCESS_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT } = require('./colors'); // Adjust path as necessary

class CFacade_Base {
    constructor(m_module) {
        this.m_module = m_module;
    }

    requestID(targetPartyID) {
        const message = {
            C: TYPE_AndruavMessage_ID
        };

        this.m_module.sendJMSG(targetPartyID, message, TYPE_AndruavMessage_RemoteExecute, true);
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

        this.m_module.sendJMSG(targetPartyID, message, TYPE_AndruavMessage_Error, false);

        console.log(`\n${SUCCESS_CONSOLE_BOLD_TEXT} -- sendErrorMessage ${NORMAL_CONSOLE_TEXT}${description}`);
    }
}

class CMyFacade extends CFacade_Base {
    constructor(m_module) {
        super(m_module);
    }

    // Add your custom methods here
    myCustomMethod(arg1, arg2) {
        // Implement your custom method here
    }
}

module.exports = { CFacade_Base, CMyFacade };