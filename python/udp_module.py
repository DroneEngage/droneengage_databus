"""
Python implementation of UDP client module
Equivalent to Node.js client functionality
"""

import socket
import json
import threading
import time
import signal
import sys
from typing import Dict, Any, Callable, Optional
try:
    from .colors import Colors
    from .messages import *
except ImportError:
    from console_colors import Colors
    from messages import *


class UDPModule:
    """
    UDP communication module equivalent to Node.js CModule
    """
    
    def __init__(self):
        self.target_ip = "0.0.0.0"
        self.target_port = 60000
        self.listen_ip = "0.0.0.0"
        self.listen_port = 61111
        self.packet_size = 8192
        self.socket = None
        self.running = False
        self.message_handlers = {}
        
        # Module info
        self.module_class = "gen"
        self.module_name = ""
        self.module_id = ""
        self.module_version = "0.0.1"
        self.module_features = []
        self.hardware_id = ""
        self.hardware_type = 1
        
    def define_module(self, module_class: str, module_name: str, module_id: str, 
                     version: str, features: list):
        """Define module properties"""
        self.module_class = module_class
        self.module_name = module_name
        self.module_id = module_id
        self.module_version = version
        self.module_features = features.copy()
        
    def add_module_features(self, feature: str):
        """Add module feature"""
        if feature not in self.module_features:
            self.module_features.append(feature)
    
    def set_hardware(self, hardware_id: str, hardware_type: int):
        """Set hardware verification info"""
        self.hardware_id = hardware_id
        self.hardware_type = hardware_type
    
    def init(self, target_ip: str, target_port: int, listen_ip: str, listen_port: int, packet_size: int):
        """Initialize UDP communication"""
        self.target_ip = target_ip
        self.target_port = target_port
        self.listen_ip = listen_ip
        self.listen_port = listen_port
        self.packet_size = packet_size
        
        # Create UDP socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.socket.bind((self.listen_ip, self.listen_port))
            self.running = True
            print(f"{Colors.SUCCESS_CONSOLE_TEXT}UDP Module initialized successfully{Colors.NORMAL_CONSOLE_TEXT}")
            print(f"Listening on {self.listen_ip}:{self.listen_port}")
            print(f"Target: {self.target_ip}:{self.target_port}")
        except Exception as e:
            print(f"{Colors.ERROR_CONSOLE_TEXT}Failed to bind socket: {e}{Colors.NORMAL_CONSOLE_TEXT}")
            raise
    
    def send_jmsg(self, target_party_id: str, message: Dict[str, Any], 
                 message_type: int, is_binary: bool = False):
        """Send JSON message"""
        try:
            # Add protocol fields
            full_message = {
                "sd": self.module_id,  # Sender
                "tg": target_party_id,  # Target
                "mt": message_type,     # Message type
                "ms": message          # Message content
            }
            
            # Convert to JSON string
            json_message = json.dumps(full_message)
            
            # Send via UDP
            self.socket.sendto(json_message.encode('utf-8'), 
                             (self.target_ip, self.target_port))
            
            print(f"{Colors.INFO_CONSOLE_TEXT}Message sent to {target_party_id}{Colors.NORMAL_CONSOLE_TEXT}")
            
        except Exception as e:
            print(f"{Colors.ERROR_CONSOLE_TEXT}Failed to send message: {e}{Colors.NORMAL_CONSOLE_TEXT}")
    
    def start_receiving(self):
        """Start receiving messages in background thread"""
        def receive_loop():
            while self.running:
                try:
                    data, addr = self.socket.recvfrom(self.packet_size)
                    message = data.decode('utf-8')
                    
                    # Parse and handle message
                    try:
                        json_message = json.loads(message)
                        self._handle_received_message(json_message, message, len(message))
                    except json.JSONDecodeError as e:
                        print(f"{Colors.ERROR_CONSOLE_TEXT}Failed to parse JSON: {e}{Colors.NORMAL_CONSOLE_TEXT}")
                        
                except Exception as e:
                    if self.running:  # Only print if not shutting down
                        print(f"{Colors.ERROR_CONSOLE_TEXT}Receive error: {e}{Colors.NORMAL_CONSOLE_TEXT}")
                    break
        
        receive_thread = threading.Thread(target=receive_loop, daemon=True)
        receive_thread.start()
        print(f"{Colors.INFO_CONSOLE_TEXT}Started message receiver thread{Colors.NORMAL_CONSOLE_TEXT}")
    
    def _handle_received_message(self, json_message: Dict[str, Any], full_message: str, 
                                full_message_length: int):
        """Handle received message"""
        message_type = json_message.get("mt", 0)
        print(f"{Colors.INFO_CONSOLE_TEXT}Received message type: {message_type}{Colors.NORMAL_CONSOLE_TEXT}")
        
        # Call registered handlers
        if message_type in self.message_handlers:
            handler = self.message_handlers[message_type]
            handler(json_message, full_message, full_message_length)
    
    def register_message_handler(self, message_type: int, handler: Callable):
        """Register a message handler"""
        self.message_handlers[message_type] = handler
    
    def uninit(self):
        """Cleanup and shutdown"""
        self.running = False
        if self.socket:
            self.socket.close()
        print(f"{Colors.SUCCESS_CONSOLE_TEXT}UDP Module shutdown complete{Colors.NORMAL_CONSOLE_TEXT}")


class MyFacade:
    """
    Facade class equivalent to Node.js CMyFacade
    """
    
    def __init__(self, module: UDPModule):
        self.module = module
    
    def send_error_message(self, target_party_id: str, error_number: int, info_type: int, 
                          notification_type: int, description: str):
        """Send error message"""
        message = {
            "EN": error_number,
            "IT": info_type,
            "NT": notification_type,
            "DS": description
        }
        self.module.send_jmsg(target_party_id, message, TYPE_AndruavMessage_Error, False)
        print(f"{Colors.SUCCESS_CONSOLE_BOLD_TEXT} -- sendErrorMessage {Colors.NORMAL_CONSOLE_TEXT}{description}")


# Export for compatibility
CModule = UDPModule
CMyFacade = MyFacade
