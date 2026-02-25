import sys
import json
import random
import time
import threading
import argparse
import signal

from de_module import *
from udpClient import *
from colors import *
from messages import *

from de_facade_base import *

DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192 

shutdown_requested = False

def signal_handler(signum, frame):
    global shutdown_requested
    print(f"\n{INFO_CONSOLE_TEXT}Received signal {signum}, shutting down gracefully...{NORMAL_CONSOLE_TEXT}")
    shutdown_requested = True

def send_msg():
   my_facade_class.sendErrorMessage("",NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO,"Hello from python")

def generate_random_module_id():
    return ''.join(random.choice('0123456789') for _ in range(12))

cModule = CModule()
my_facade_class = MyFacade(cModule)

def print_usage():
    """Print detailed usage information"""
    print(INFO_CONSOLE_BOLD_TEXT + "DroneEngage Python Client Module" + NORMAL_CONSOLE_TEXT)
    print()
    print(SUCCESS_CONSOLE_BOLD_TEXT + "USAGE:" + NORMAL_CONSOLE_TEXT)
    print("  python client.py [OPTIONS] MODULE_NAME de_comm_port LISTEN_PORT")
    print()
    print(SUCCESS_CONSOLE_BOLD_TEXT + "ARGUMENTS:" + NORMAL_CONSOLE_TEXT)
    print("  MODULE_NAME    Name of the module (e.g., DE_Plugin, My_Custom_DE_Module)")
    print("  de_comm_port    Port where DE Communicator (de_comm) is running (default: 60000)")
    print("  LISTEN_PORT    Port for this module to listen on (default: 61111)")
    print()
    print(SUCCESS_CONSOLE_BOLD_TEXT + "OPTIONS:" + NORMAL_CONSOLE_TEXT)
    print("  -h, --help     Show this help message and exit")
    print()
    print(SUCCESS_CONSOLE_BOLD_TEXT + "EXAMPLES:" + NORMAL_CONSOLE_TEXT)
    print("  python client.py sample_mod_py 60000 61111")
    print("  python client.py PY_Plugin 60000 61233")
    print()
    print(INFO_CONSOLE_BOLD_TEXT + "DESCRIPTION:" + NORMAL_CONSOLE_TEXT)
    print("  This client connects to a DE Communicator (de_comm) and appears in the")
    print("  WebClient Details tab as a module with the specified name.")
    print("  The module supports sending and receiving telemetry messages.")

if __name__ == "__main__":
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='DroneEngage Python Client Module',
        add_help=False  # We'll handle help manually to show our custom usage
    )
    
    parser.add_argument('module_name', nargs='?', help='Name of the module')
    parser.add_argument('de_comm_port', nargs='?', type=int, default=60000, help='DroneEngageCommunicator (de_comm) port (default: 60000)')
    parser.add_argument('listen_port', nargs='?', type=int, default=61111, help='Listen port (default: 61111)')
    parser.add_argument('-h', '--help', action='store_true', help='Show help message')
    
    args = parser.parse_args()
    
    # Show help if requested
    if args.help or not args.module_name:
        print_usage()
        if not args.help:
            print("Press any key to continue ...")
            input()
        exit(0 if args.help else 1)
    
    module_name = args.module_name
    target_port = args.de_comm_port
    listen_port = args.listen_port

    module_id = generate_random_module_id()

    print(INFO_CONSOLE_TEXT + "Client Module-Started " + NORMAL_CONSOLE_TEXT)

    # Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_name,
        module_id,
        "0.0.1",
        json.loads("[]")  # WAITING FOR NO MESSAGES
    )

    # Add feature this module supports. [OPTIONAL]
    cModule.add_module_features(MODULE_FEATURE_SENDING_TELEMETRY)
    cModule.add_module_features(MODULE_FEATURE_RECEIVING_TELEMETRY)

    # Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.set_hardware("123456", HARDWARE_TYPE_CPU)

    cModule.init("0.0.0.0", target_port, "0.0.0.0", listen_port, DEFAULT_UDP_DATABUS_PACKET_SIZE)

    print("Client Module RUNNING ")

    try:
        while not shutdown_requested:
            time.sleep(1)
            if not shutdown_requested:
                print("Client Module RUNNING ")
                send_msg()
    except KeyboardInterrupt:
        print(f"\n{INFO_CONSOLE_TEXT}Keyboard interrupt received, shutting down...{NORMAL_CONSOLE_TEXT}")
    finally:
        print(f"{INFO_CONSOLE_TEXT}Cleaning up resources...{NORMAL_CONSOLE_TEXT}")
        cModule.uninit()
        print(f"{SUCCESS_CONSOLE_TEXT}Client Module EXIT{NORMAL_CONSOLE_TEXT}")

    