/**
 * NodeJS implementation of de_common/de_databus/de_message_parser_base.hpp/cpp
 * Equivalent to C++ CAndruavMessageParserBase class
 */

const fs = require('fs');
const {
    ANDRUAV_PROTOCOL_MESSAGE_TYPE,
    ANDRUAV_PROTOCOL_MESSAGE_PERMISSION,
    ANDRUAV_PROTOCOL_SENDER,
    INTERMODULE_ROUTING_TYPE,
    CMD_TYPE_INTERMODULE,
    ANDRUAV_PROTOCOL_SENDER_COMM_SERVER,
    TYPE_AndruavMessage_RemoteExecute,
    TYPE_AndruavMessage_CONFIG_ACTION,
    CONFIG_ACTION_Restart,
    CONFIG_ACTION_APPLY_CONFIG,
    CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE,
    CONFIG_REQUEST_FETCH_CONFIG,
    ERROR_3DR,
    NOTIFICATION_TYPE_ERROR,
    ANDRUAV_PROTOCOL_MESSAGE_CMD,
    TYPE_AndruavMessage_Error,
    TYPE_AndruavMessage_CONFIG_STATUS,
    CONFIG_STATUS_FETCH_CONFIG_TEMPLATE
} = require('./messages');

class AndruavMessageParserBase {
    /**
     * Abstract base class for parsing Andruav messages
     */
    constructor() {
        this._is_binary = false;
        this._is_system = false;
        this._is_inter_module = false;
        this._facade = null; // Will be set by subclass
    }

    /**
     * Parse incoming Andruav message
     * @param {Object} andruav_message - Parsed JSON message
     * @param {string|Buffer} full_message - Raw message
     * @param {number} full_message_length - Message length
     */
    parseMessage(andruav_message, full_message, full_message_length) {
        const messageType = andruav_message[ANDRUAV_PROTOCOL_MESSAGE_TYPE] || 0;
        
        // Check if message is binary (doesn't end with '}')
        if (Buffer.isBuffer(full_message)) {
            this._is_binary = true;
        } else {
            const str = full_message.toString();
            this._is_binary = !(str.endsWith('}') || (str.length > 1 && str[str.length - 2] === '}'));
        }

        // Get permission if available
        let permission = 0;
        if (this._validateField(andruav_message, ANDRUAV_PROTOCOL_MESSAGE_PERMISSION, 'number')) {
            permission = andruav_message[ANDRUAV_PROTOCOL_MESSAGE_PERMISSION];
        }

        // Check if message is from system
        this._is_system = false;
        if (this._validateField(andruav_message, ANDRUAV_PROTOCOL_SENDER, 'string') &&
            andruav_message[ANDRUAV_PROTOCOL_SENDER] === ANDRUAV_PROTOCOL_SENDER_COMM_SERVER) {
            this._is_system = true;
        }

        // Check if message is inter-module
        this._is_inter_module = false;
        if (this._validateField(andruav_message, INTERMODULE_ROUTING_TYPE, 'string') &&
            andruav_message[INTERMODULE_ROUTING_TYPE] === CMD_TYPE_INTERMODULE) {
            this._is_inter_module = true;
        }

        // Handle RemoteExecute messages
        if (messageType === TYPE_AndruavMessage_RemoteExecute) {
            this.parseRemoteExecute(andruav_message);
            return;
        }

        // Parse default commands and custom commands
        this._parseDefaultCommand(andruav_message, full_message, full_message_length, messageType, permission);
        this.parseCommand(andruav_message, full_message, full_message_length, messageType, permission);
    }

    /**
     * Parse default commands that are common across all modules
     * @private
     */
    _parseDefaultCommand(andruav_message, full_message, full_message_length, messageType, permission) {
        const cmd = andruav_message[ANDRUAV_PROTOCOL_MESSAGE_CMD] || {};

        if (messageType === TYPE_AndruavMessage_CONFIG_ACTION) {
            this._handleConfigAction(andruav_message, cmd);
        }
    }

    /**
     * Handle configuration action commands
     * @private
     */
    _handleConfigAction(andruav_message, cmd) {
        let module_key = "";
        
        // Validate action field
        if (!this._validateField(cmd, "a", 'number')) {
            return;
        }

        // Check module key if specified
        if (this._validateField(cmd, "b", 'string')) {
            module_key = this._getModuleKey();
            if (module_key !== cmd["b"]) {
                return;
            }
        }

        const action = cmd["a"];

        if (action === CONFIG_ACTION_Restart) {
            console.log("CONFIG_ACTION_Restart - exiting");
            process.exit(0);
        }

        else if (action === CONFIG_ACTION_APPLY_CONFIG) {
            const config = cmd["c"] || {};
            console.log("CONFIG_ACTION_APPLY_CONFIG:", config);
            // Note: ConfigFile implementation would go here
            // For now, just print the config
        }

        else if (action === CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE) {
            if (!andruav_message.hasOwnProperty(ANDRUAV_PROTOCOL_SENDER)) {
                return;
            }

            const sender = andruav_message[ANDRUAV_PROTOCOL_SENDER];
            console.log("\n\x1b[96mCONFIG_REQUEST_FETCH_CONFIG_TEMPLATE\x1b[0m");

            try {
                const fileContent = fs.readFileSync("template.json", 'utf8');
                const fileContentJson = JSON.parse(fileContent);
                if (this._facade) {
                    this._facade.api_send_config_template(sender, module_key, fileContentJson, true);
                }
            } catch (error) {
                console.log("\n\x1b[1;91mcannot read template.json\x1b[0m");
                if (this._facade) {
                    this._facade.send_error_message("", 0, ERROR_3DR, 
                        NOTIFICATION_TYPE_ERROR, "cannot read template.json");
                    const emptyFileContentJson = {};
                    this._facade.api_send_config_template(sender, module_key, emptyFileContentJson, true);
                }
                return;
            }
        }

        else if (action === CONFIG_REQUEST_FETCH_CONFIG) {
            // Implementation for fetching current config
            console.log("CONFIG_REQUEST_FETCH_CONFIG - not implemented");
        }

        // Add other config actions as needed
    }

    /**
     * Validate if a field exists and has the expected type
     * @private
     */
    _validateField(jsonObj, fieldName, expectedType) {
        return jsonObj.hasOwnProperty(fieldName) && typeof jsonObj[fieldName] === expectedType;
    }

    /**
     * Get module key - should be implemented by subclass or injected dependency
     * @private
     */
    _getModuleKey() {
        // This would typically come from a module instance
        // For now, return empty string
        return "";
    }

    /**
     * Check if message is binary
     * @returns {boolean}
     */
    get isBinary() {
        return this._is_binary;
    }

    /**
     * Check if message is from system
     * @returns {boolean}
     */
    get isSystem() {
        return this._is_system;
    }

    /**
     * Check if message is inter-module
     * @returns {boolean}
     */
    get isInterModule() {
        return this._is_inter_module;
    }

    /**
     * Parse remote execute commands - must be implemented by subclass
     * @abstract
     */
    parseRemoteExecute(andruav_message) {
        throw new Error("parseRemoteExecute must be implemented by subclass");
    }

    /**
     * Parse custom commands - must be implemented by subclass
     * @abstract
     */
    parseCommand(andruav_message, full_message, full_message_length, messageType, permission) {
        throw new Error("parseCommand must be implemented by subclass");
    }
}

// Export the class for compatibility with C++ naming convention
module.exports = {
    AndruavMessageParserBase,
    CAndruavMessageParserBase: AndruavMessageParserBase  // Alias for C++ compatibility
};
