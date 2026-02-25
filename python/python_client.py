#!/usr/bin/env python3
"""
Python equivalent of nodejs/client.js
DroneEngage Python Client Module
"""

import sys
import signal
import time
import argparse
import threading
from typing import Optional

try:
    from .udp_module import CModule, CMyFacade
    from .colors import Colors
    from .messages import *
except ImportError:
    from udp_module import CModule, CMyFacade
    from console_colors import Colors
    from messages import *


DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192

shutdown_requested = False
interval_thread: Optional[threading.Thread] = None


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    global shutdown_requested
    print(f"\n{Colors.INFO_CONSOLE_TEXT}Received signal {signum}, shutting down gracefully...{Colors.NORMAL_CONSOLE_TEXT}")
    shutdown_requested = True
    cleanup_and_exit()


def cleanup_and_exit():
    """Cleanup resources and exit"""
    print(f"{Colors.INFO_CONSOLE_TEXT}Cleaning up resources...{Colors.NORMAL_CONSOLE_TEXT}")
    try:
        if 'c_module' in globals() and c_module:
            c_module.uninit()
    except Exception as error:
        print(f"{Colors.ERROR_CONSOLE_TEXT}Error during cleanup: {error}{Colors.NORMAL_CONSOLE_TEXT}")
    print(f"{Colors.SUCCESS_CONSOLE_BOLD_TEXT}Client Module EXIT{Colors.NORMAL_CONSOLE_TEXT}")
    sys.exit(0)


def generate_random_module_id() -> str:
    """Generate random 12-digit module ID"""
    import random
    return ''.join(str(random.randint(0, 9)) for _ in range(12))


def send_msg():
    """Send test message"""
    # Example message structure (uncomment if needed)
    # message = {
    #     "t": "THIS IS A TEST MESSAGE",
    #     "long": "Received the likewise law graceful his. Nor might set along charm now equal green. Pleased yet equally correct colonel not one. Say anxious carried compact conduct sex general nay certain. Mrs for recommend exquisite household eagerness preserved now. My improved honoured he am ecstatic quitting greatest formerly."
    # }
    # c_module.send_jmsg("", message, TYPE_AndruavMessage_DUMMY, True)
    
    base_facade.send_error_message("", NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, 
                                  NOTIFICATION_TYPE_INFO, "Hello from Python")


def print_usage():
    """Print usage information"""
    print(Colors.INFO_CONSOLE_BOLD_TEXT + "DroneEngage Python Client Module" + Colors.NORMAL_CONSOLE_TEXT)
    print()
    print(Colors.SUCCESS_CONSOLE_BOLD_TEXT + "USAGE:" + Colors.NORMAL_CONSOLE_TEXT)
    print("  python client.py [OPTIONS] MODULE_NAME de_comm_port LISTEN_PORT")
    print()
    print(Colors.SUCCESS_CONSOLE_BOLD_TEXT + "ARGUMENTS:" + Colors.NORMAL_CONSOLE_TEXT)
    print("  MODULE_NAME    Name of the module (e.g., DE_Plugin, My_Custom_DE_Module)")
    print("  de_comm_port    Port where DE Communicator (de_comm) is running (default: 60000)")
    print("  LISTEN_PORT    Port for this module to listen on (default: 61111)")
    print()
    print(Colors.SUCCESS_CONSOLE_BOLD_TEXT + "OPTIONS:" + Colors.NORMAL_CONSOLE_TEXT)
    print("  -h, --help     Show this help message and exit")
    print()
    print(Colors.SUCCESS_CONSOLE_BOLD_TEXT + "EXAMPLES:" + Colors.NORMAL_CONSOLE_TEXT)
    print("  python client.py sample_mod_py 60000 61111")
    print("  python client.py Python_Plugin 60000 61233")
    print()
    print(Colors.INFO_CONSOLE_BOLD_TEXT + "DESCRIPTION:" + Colors.NORMAL_CONSOLE_TEXT)
    print("  This client connects to a DE Communicator (de_comm) and appears in the")
    print("  WebClient Details tab as a module with the specified name.")
    print("  The module supports sending and receiving telemetry messages.")


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('module_name', nargs='?', help='Name of the module')
    parser.add_argument('de_comm_port', nargs='?', type=int, default=60000, 
                       help='Port where DE Communicator is running')
    parser.add_argument('listen_port', nargs='?', type=int, default=61111,
                       help='Port for this module to listen on')
    parser.add_argument('-h', '--help', action='store_true', help='Show help message')
    
    args = parser.parse_args()
    
    if args.help or not args.module_name:
        print_usage()
        if not args.help:
            input("Press Enter to continue...")
            sys.exit(1)
        else:
            sys.exit(0)
    
    return args


def message_loop():
    """Main message sending loop"""
    global shutdown_requested
    
    while not shutdown_requested:
        print("Client Module RUNNING")
        send_msg()
        time.sleep(1)


def main():
    """Main function"""
    global c_module, base_facade, interval_thread
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Parse arguments
    args = parse_arguments()
    
    module_name = args.module_name
    target_port = args.de_comm_port
    listen_port = args.listen_port
    
    module_id = generate_random_module_id()
    
    print(Colors.INFO_CONSOLE_TEXT + "Client Module-Started " + Colors.NORMAL_CONSOLE_TEXT)
    
    # Create module and facade
    c_module = CModule()
    base_facade = CMyFacade(c_module)
    
    # Define a Module
    c_module.define_module(
        "gen",                    # MODULE_CLASS_GENERIC
        module_name,
        module_id,
        "0.0.1",
        []
    )
    
    # Add features this module supports. [OPTIONAL]
    c_module.add_module_features("T")  # MODULE_FEATURE_SENDING_TELEMETRY
    c_module.add_module_features("R")  # MODULE_FEATURE_RECEIVING_TELEMETRY
    
    # Add Hardware Verification Info to be verified by the server. [OPTIONAL]
    c_module.set_hardware("123456", 1)  # HARDWARE_TYPE_CPU
    
    # Initialize UDP communication
    try:
        c_module.init("0.0.0.0", target_port, "0.0.0.0", listen_port, DEFAULT_UDP_DATABUS_PACKET_SIZE)
    except Exception as e:
        print(f"{Colors.ERROR_CONSOLE_TEXT}Failed to initialize module: {e}{Colors.NORMAL_CONSOLE_TEXT}")
        sys.exit(1)
    
    # Start receiving messages
    c_module.start_receiving()
    
    print("Client Module RUNNING")
    
    # Start message sending loop
    interval_thread = threading.Thread(target=message_loop, daemon=True)
    interval_thread.start()
    
    try:
        # Keep main thread alive
        while not shutdown_requested:
            time.sleep(0.1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    
    # Wait for cleanup
    if interval_thread and interval_thread.is_alive():
        interval_thread.join(timeout=2)


if __name__ == "__main__":
    main()
