#!/usr/bin/env python3
"""
DroneEngage MAVLink Listener Example
------------------------------------
A minimal module that uses the de_databus/python library to:
  1. Identify itself to a running de_comm communicator.
  2. Subscribe to TYPE_AndruavMessage_MAVLINK messages.
  3. Print every received MAVLink message (JSON header + raw binary payload).

Usage:
  python de_module.py [de_comm_port] [listen_port]

Defaults: de_comm_port=60000, listen_port=61200
"""

import sys
import time
import signal
import random
import json

# Import the de_databus python library.
# Works whether this file is run from the examples/ folder, the repo root,
# or with the package on sys.path.
try:
    from de_databus.python.colors import *
    from de_databus.python.messages import *
    from de_databus.python.de_module import CModule
    from de_databus.python.de_facade_base import CFacade_Base
except ImportError:
    # Fallback: add the python/ folder to the path (run from examples/ or repo root)
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "python"))
    from colors import *
    from messages import *
    from de_module import CModule
    from de_facade_base import CFacade_Base


MODULE_CLASS_GENERIC  = "gen"
MODULE_KEY            = "mavlisten0001"
MODULE_VERSION        = "0.0.1"

DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192
DEFAULT_DE_COMM_PORT            = 60000
DEFAULT_LISTEN_PORT             = 61200

# Subscribe to module ID (registration handshake) and MAVLink messages.
MESSAGE_FILTER = [
    TYPE_AndruavMessage_ID,
    TYPE_AndruavMessage_MAVLINK,
    TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_INTERNAL_MAVLINK,
]

cModule   = CModule()
facade    = CFacade_Base(cModule)
exit_me   = False


def generate_random_module_id():
    return ''.join(random.choice('0123456789') for _ in range(12))


def on_message(message, length, jMsg):
    """
    Called by CModule.onReceive for every message that passes the filter.
    `message` is the raw bytes (JSON header + null terminator + binary payload).
    `jMsg`   is the parsed JSON header dict.
    """
    message_type = jMsg.get(ANDRUAV_PROTOCOL_MESSAGE_TYPE)

    if message_type == TYPE_AndruavMessage_ID:
        # Registration handshake handled by CModule already; nothing to do.
        return

    # --- MAVLink messages (binary) ---
    # The JSON header is null-terminated; the raw MAVLink bytes follow.
    null_index = message.find(b'\x00')
    binary_payload = b''
    if null_index != -1 and null_index + 1 < len(message):
        binary_payload = message[null_index + 1:]

    sender = jMsg.get(ANDRUAV_PROTOCOL_SENDER, "?")
    cmd    = jMsg.get(ANDRUAV_PROTOCOL_MESSAGE_CMD, {})

    print(LOG_CONSOLE_BOLD_TEXT
          + f"RX MAVLINK  type={message_type}  sender={sender}"
          + INFO_CONSOLE_TEXT
          + f"  json_cmd={json.dumps(cmd) if cmd else '{}'}"
          + NORMAL_CONSOLE_TEXT)
    print(INFO_CONSOLE_TEXT
          + f"  binary: {len(binary_payload)} bytes  hex={binary_payload.hex()}"
          + NORMAL_CONSOLE_TEXT)


def quit_handler(sig, frame):
    global exit_me
    print(INFO_CONSOLE_TEXT + "\nTERMINATING AT USER REQUEST" + NORMAL_CONSOLE_TEXT)
    exit_me = True


def main():
    global exit_me

    signal.signal(signal.SIGINT, quit_handler)
    signal.signal(signal.SIGTERM, quit_handler)

    de_comm_port = DEFAULT_DE_COMM_PORT
    listen_port  = DEFAULT_LISTEN_PORT
    if len(sys.argv) >= 2:
        de_comm_port = int(sys.argv[1])
    if len(sys.argv) >= 3:
        listen_port = int(sys.argv[2])

    module_id = generate_random_module_id()

    print()
    print(SUCCESS_CONSOLE_BOLD_TEXT
          + "=================== MAVLink Listener Example ==================="
          + NORMAL_CONSOLE_TEXT)
    print(INFO_CONSOLE_TEXT + f"module_id={module_id}  key={MODULE_KEY}" + NORMAL_CONSOLE_TEXT)

    # Register the message callback.
    cModule.m_OnReceive = on_message

    # Define this module so de_comm knows who we are.
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_id,
        MODULE_KEY,
        MODULE_VERSION,
        MESSAGE_FILTER,
    )

    # Connect to the running de_comm (127.0.0.1:de_comm_port).
    cModule.init(
        "127.0.0.1", de_comm_port,
        "0.0.0.0", listen_port,
        DEFAULT_UDP_DATABUS_PACKET_SIZE,
    )

    print(SUCCESS_CONSOLE_TEXT + "Listening for MAVLink messages... (Ctrl+C to quit)" + NORMAL_CONSOLE_TEXT)

    while not exit_me:
        time.sleep(0.1)

    cModule.uninit()
    print(SUCCESS_CONSOLE_BOLD_TEXT + "MAVLink Listener EXIT" + NORMAL_CONSOLE_TEXT)


if __name__ == "__main__":
    main()
