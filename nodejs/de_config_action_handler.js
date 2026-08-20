/**
 * Handles TYPE_AndruavMessage_CONFIG_ACTION messages sent by the GCS/Communicator
 * to remotely restart the module, apply a new configuration, or fetch the module's
 * config template.
 * Mirrors de::comm::CAndruavMessageParserBase::handleConfigAction (C++ de_common).
 *
 * @param cModule           - CModule instance
 * @param facade            - CFacade_Base instance
 * @param config_file       - config file object (or null)
 * @param andruav_message   - parsed JSON header of the incoming message
 * @param cmd               - the ANDRUAV_PROTOCOL_MESSAGE_CMD object
 * @param on_config_applied - optional callback(config) invoked right after
 *        a CONFIG_ACTION_APPLY_CONFIG has been persisted, so the caller can
 *        apply the new settings live without requiring a restart.
 */

const fs = require('fs');
const {
    ANDRUAV_PROTOCOL_SENDER,
    CONFIG_ACTION_Restart,
    CONFIG_ACTION_APPLY_CONFIG,
    CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE,
    CONFIG_REQUEST_FETCH_CONFIG,
    ERROR_3DR,
    NOTIFICATION_TYPE_ERROR
} = require('./messages');
const { ERROR_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT } = require('./colors');

function handleConfigAction(cModule, facade, config_file, andruav_message, cmd, on_config_applied) {
    if (!cmd.hasOwnProperty("a")) {
        return;
    }

    let module_key = "";
    if (cmd.hasOwnProperty("b")) {
        module_key = cModule.m_module_key;
        if (module_key !== cmd["b"]) {
            return;
        }
    }

    const action = cmd["a"];

    if (action === CONFIG_ACTION_Restart) {
        process.exit(0);
    }

    else if (action === CONFIG_ACTION_APPLY_CONFIG) {
        const config = cmd["c"] || {};
        console.log(config);
        if (config_file !== null) {
            config_file.updateJSON(JSON.stringify(config));
            if (on_config_applied !== null && on_config_applied !== undefined) {
                try {
                    on_config_applied(config_file.config);
                } catch (e) {
                    console.log(`ERROR: on_config_applied callback failed: ${e}`);
                }
            }
        }
    }

    else if (action === CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE) {
        if (!andruav_message.hasOwnProperty(ANDRUAV_PROTOCOL_SENDER)) {
            return;
        }
        const sender = andruav_message[ANDRUAV_PROTOCOL_SENDER];

        try {
            const file_content = fs.readFileSync("template.json", 'utf8');
            const file_content_json = JSON.parse(file_content);
            facade.API_sendConfigTemplate(sender, module_key, file_content_json, true);
        } catch (e) {
            console.log(ERROR_CONSOLE_BOLD_TEXT + `cannot read template.json: ${e}` + NORMAL_CONSOLE_TEXT);
            facade.sendErrorMessage("", 0, ERROR_3DR, NOTIFICATION_TYPE_ERROR, "cannot read template.json");
            facade.API_sendConfigTemplate(sender, module_key, {}, true);
        }
    }

    else if (action === CONFIG_REQUEST_FETCH_CONFIG) {
        // not implemented
    }
}

module.exports = { handleConfigAction };
