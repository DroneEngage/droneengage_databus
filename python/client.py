import sys
import json
import random
import time
import threading

from de_module import *
from udpClient import *
from colors import *
from messages import *

from de_facade_base import *

DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192 

cModule = CModule()

my_facade_class = MyFacade (cModule)

def generate_random_module_id():
    return ''.join(random.choice('0123456789') for _ in range(12))

def send_msg():
   my_facade_class.sendErrorMessage("",NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO,"Hello from python")

if __name__ == "__main__":
    print(INFO_CONSOLE_BOLD_TEXT + "This module can be used as follows:" + NORMAL_CONSOLE_TEXT)
    print(SUCCESS_CONSOLE_BOLD_TEXT + "python client MODULE_NAME 60000 61111" + NORMAL_CONSOLE_TEXT)
    print(INFO_CONSOLE_BOLD_TEXT + "If drone engage is running on port 60000 it will connect to it and appears in WebClient Details tab as a module named sample_mod_py." + NORMAL_CONSOLE_TEXT)
    print("Press any key to continue ...")
    
    if len(sys.argv) < 4:
        input()
        print(INFO_CONSOLE_BOLD_TEXT + "Insufficient arguments. Usage: app module_name broker_port(60000) listen_port(60003) e.g. python client.py PY_Plugin 60000 61233" + NORMAL_CONSOLE_TEXT)
        exit(1)

    module_name = sys.argv[1]
    target_port = int(sys.argv[2])
    listen_port = int(sys.argv[3])

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

    while True:
        time.sleep(1)
        print("Client Module RUNNING ")
        send_msg()

    #ifdef DEBUG
    print("EXIT ")
    #endif

    