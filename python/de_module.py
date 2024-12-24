

import json
import time
import threading
from enum import Enum
from messages import *
from udpClient import *

import json


MODULE_FEATURE_RECEIVING_TELEMETRY      = "R"
MODULE_FEATURE_SENDING_TELEMETRY        = "T"
MODULE_FEATURE_CAPTURE_IMAGE            = "C"
MODULE_FEATURE_CAPTURE_VIDEO            = "V"


MODULE_CLASS_COMM                       = "comm"
MODULE_CLASS_FCB                        = "fcb"
MODULE_CLASS_VIDEO                      = "camera"
MODULE_CLASS_P2P                        = "p2p"
MODULE_CLASS_GENERIC                    = "gen"

HARDWARE_TYPE_UNDEFINED = 0
HARDWARE_TYPE_CPU = 1

class CModule(object):

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(CModule, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.m_module_class = ""
        self.m_module_id = ""
        self.m_module_key = ""
        self.m_module_version = ""
        self.m_message_filter = {}
        self.cUDPClient = None
        self.m_party_id = ""
        self.m_group_id = ""
        self.m_OnReceive = None
        self.m_stdinValues = {}
        self.m_FirstReceived = False
        self.m_module_features = []  # Initialize the list of module features
        self.m_hardware_serial = ""
        self.m_hardware_serial_type = ""
        self.m_instance_time_stamp = time.time()
        self.m_lock = threading.RLock()

    def init(self, target_ip, broadcasts_port, host, listening_port, chunk_size,):
        # UDP Server
        self.cUDPClient = CUDPClient()
        self.cUDPClient.init(target_ip, broadcasts_port, host, listening_port, chunk_size, self.onReceive)
        self.createJSONID(True)
        self.cUDPClient.start()
        return True

    def uninit(self):
        self.cUDPClient.stop()
        return True

    def defineModule(self, module_class, module_id, module_key, module_version, message_filter):
        self.m_module_class = module_class
        self.m_module_id = module_id
        self.m_module_key = module_key
        self.m_module_version = module_version
        self.m_message_filter = message_filter

    def add_module_features(self, feature):
        self.m_module_features.append(feature)
    
    def set_hardware(self, hardware_serial, hardware_serial_type):
        self.m_hardware_serial = hardware_serial
        self.m_hardware_serial_type = hardware_serial_type
    
    def sendMSG(self, msg, length):
        self.cUDPClient.sendMSG(msg, length)
    
    def send_sys_msg(self, jmsg, andruav_message_id):
        full_message = {
            ANDRUAV_PROTOCOL_TARGET_ID: SPECIAL_NAME_SYS_NAME,
            INTERMODULE_ROUTING_TYPE: CMD_COMM_SYSTEM,
            ANDRUAV_PROTOCOL_MESSAGE_TYPE: andruav_message_id,
            ANDRUAV_PROTOCOL_MESSAGE_CMD: jmsg
        }
        msg = json.dumps(full_message)
        self.send_msg(msg.encode(), len(msg))

    
    def sendJMSG(self, targetPartyID, jmsg, andruav_message_id, internal_message):
        """Generate and sends JSON text string

        Args:
            targetPartyID (_type_): destination unit partyid
            jmsg (_type_): _description_
            andruav_message_id (_type_): _description_
            internal_message (_type_): _description_
        """
        with self.m_lock:
            fullMessage = {}

            msg_routing_type = CMD_COMM_GROUP
            if internal_message:
                msg_routing_type = CMD_TYPE_INTERMODULE
            elif targetPartyID:
                msg_routing_type = CMD_COMM_INDIVIDUAL

            fullMessage[INTERMODULE_MODULE_KEY] = self.m_module_key
            fullMessage[ANDRUAV_PROTOCOL_TARGET_ID] = targetPartyID
            fullMessage[INTERMODULE_ROUTING_TYPE] = msg_routing_type
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = andruav_message_id
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD] = jmsg

            msg = json.dumps(fullMessage)
            print(f"sendJMSG: {msg}")
            self.sendMSG(msg.encode(), len(msg))

    def sendBMSG(self, targetPartyID, bmsg, bmsg_length, andruav_message_id, internal_message, message_cmd):
        with self.m_lock:
            fullMessage = {}

            msg_routing_type = CMD_COMM_GROUP
            if internal_message:
                msg_routing_type = CMD_TYPE_INTERMODULE
            elif targetPartyID:
                msg_routing_type = CMD_COMM_INDIVIDUAL

            fullMessage[INTERMODULE_MODULE_KEY] = self.m_module_key
            fullMessage[ANDRUAV_PROTOCOL_TARGET_ID] = targetPartyID
            fullMessage[INTERMODULE_ROUTING_TYPE] = msg_routing_type
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = andruav_message_id
            fullMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD] = message_cmd

            json_msg = json.dumps(fullMessage)

            msg = json_msg.encode('utf-8')
            msg += b'\0'
            if bmsg_length:
                msg += bmsg

            self.sendMSG(msg, len(msg))

    def sendMREMSG(self, command_type):
        with self.m_lock:
            json_msg = {
                INTERMODULE_MODULE_KEY: self.m_module_key,
                INTERMODULE_ROUTING_TYPE: "CMD_TYPE_INTERMODULE",
                ANDRUAV_PROTOCOL_MESSAGE_TYPE: "TYPE_AndruavModule_RemoteExecute",
                ANDRUAV_PROTOCOL_MESSAGE_CMD: {"C": command_type}
            }

            msg = json.dumps(json_msg)
            self.sendMSG(msg.encode(), len(msg))

    def forwardMSG(self, message, datalength):
        self.sendMSG(message, datalength)

    def onReceive(self, message, len):
        print(f"RX MSG: :len {len}:{message}")

        try:
            jMsg = json.loads(message)

            print(f"RX MSG: jMsg{json.dumps(jMsg)}")

            if ANDRUAV_PROTOCOL_MESSAGE_TYPE not in jMsg:
                return
            if INTERMODULE_ROUTING_TYPE not in jMsg:
                return

            if jMsg[INTERMODULE_ROUTING_TYPE] == CMD_TYPE_INTERMODULE:
                if ANDRUAV_PROTOCOL_MESSAGE_CMD not in jMsg:
                    return

                cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD]

                messageType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE]
                if messageType == TYPE_AndruavModule_ID:
                    moduleID = cmd["f"]

                    if "f" not in cmd:
                        return
                    if ANDRUAV_PROTOCOL_SENDER not in moduleID:
                        return
                    if ANDRUAV_PROTOCOL_GROUP_ID not in moduleID:
                        return

                    self.m_party_id = moduleID[ANDRUAV_PROTOCOL_SENDER]
                    self.m_group_id = moduleID[ANDRUAV_PROTOCOL_GROUP_ID]

                    if not self.m_FirstReceived:
                        print(f" ** Communicator Server Found: m_party_id({self.m_party_id}) m_group_id({self.m_group_id})")
                        self.createJSONID(False)
                        self.m_FirstReceived = True

                    if self.m_OnReceive:
                        self.m_OnReceive(message, len, jMsg)

                    return

                elif messageType == TYPE_AndruavMessage_DUMMY:
                    print(f" TYPE_AndruavMessage_DUMMY {message}")

            if self.m_OnReceive:
                self.m_OnReceive(message, len, jMsg)

        except Exception as e:
            print(f"ERROR:{e}")

    def appendExtraField(self, name, ms):
        self.m_stdinValues[name] = ms

    def createJSONID(self, reSend):
        json_msg = {}
        
        json_msg[INTERMODULE_ROUTING_TYPE] = CMD_TYPE_INTERMODULE
        json_msg[ANDRUAV_PROTOCOL_MESSAGE_TYPE] = TYPE_AndruavModule_ID
        ms = {}
        
        ms[JSON_INTERMODULE_MODULE_ID] = self.m_module_id
        ms[JSON_INTERMODULE_MODULE_CLASS] = self.m_module_class
        ms[JSON_INTERMODULE_MODULE_MESSAGES_LIST] = self.m_message_filter
        ms[JSON_INTERMODULE_MODULE_FEATURES] = self.m_module_features
        ms[JSON_INTERMODULE_MODULE_KEY] = self.m_module_key
        ms[JSON_INTERMODULE_HARDWARE_ID] = self.m_hardware_serial
        ms[JSON_INTERMODULE_HARDWARE_TYPE] = self.m_hardware_serial_type
        ms[JSON_INTERMODULE_VERSION] = self.m_module_version
        ms[JSON_INTERMODULE_RESEND] = reSend
        ms[JSON_INTERMODULE_TIMESTAMP_INSTANCE] = self.m_instance_time_stamp
        
        for key, value in self.m_stdinValues.items():
            ms[key] = value
        
        json_msg[ANDRUAV_PROTOCOL_MESSAGE_CMD] = ms
        
        #print(json.dumps(json_msg, indent=4))
        
        self.cUDPClient.setJsonId(json.dumps(json_msg))
