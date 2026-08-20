import json

try:
    from .colors import *
    from .messages import *
except ImportError:
    from colors import *
    from messages import *


def handle_config_action(cModule, facade, config_file, andruav_message, cmd, on_config_applied=None):
    """
    Handles TYPE_AndruavMessage_CONFIG_ACTION messages sent by the GCS/Communicator
    to remotely restart the module, apply a new configuration, or fetch the module's
    config template.
    Mirrors de::comm::CAndruavMessageParserBase::handleConfigAction (C++ de_common).

    @param on_config_applied: optional callback(config: dict) invoked right after
           a CONFIG_ACTION_APPLY_CONFIG has been persisted, so the caller can apply
           the new settings live (e.g. volume/mute) without requiring a restart.
    """
    if "a" not in cmd:
        return

    module_key = ""
    if "b" in cmd:
        module_key = cModule.m_module_key
        if module_key != cmd["b"]:
            return

    action = cmd["a"]

    if action == CONFIG_ACTION_Restart:
        exit(0)

    elif action == CONFIG_ACTION_APPLY_CONFIG:
        config = cmd.get("c", {})
        print(config)
        if config_file is not None:
            config_file.updateJSON(json.dumps(config))
            if on_config_applied is not None:
                try:
                    on_config_applied(config_file.config)
                except Exception as e:
                    print(f"ERROR: on_config_applied callback failed: {e}")

    elif action == CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE:
        if ANDRUAV_PROTOCOL_SENDER not in andruav_message:
            return
        sender = andruav_message[ANDRUAV_PROTOCOL_SENDER]

        try:
            with open("template.json", "r") as f:
                file_content_json = json.load(f)
        except (OSError, json.JSONDecodeError) as e:
            print(ERROR_CONSOLE_BOLD_TEXT + f"cannot read template.json: {e}" + NORMAL_CONSOLE_TEXT)
            facade.sendErrorMessage("", 0, ERROR_3DR, NOTIFICATION_TYPE_ERROR, "cannot read template.json")
            facade.API_sendConfigTemplate(sender, module_key, {}, True)
            return

        facade.API_sendConfigTemplate(sender, module_key, file_content_json, True)

    elif action == CONFIG_REQUEST_FETCH_CONFIG:
        pass
