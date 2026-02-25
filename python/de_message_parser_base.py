"""
Python implementation of de_common/de_databus/de_message_parser_base.hpp/cpp
Equivalent to C++ CAndruavMessageParserBase class
"""

import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Union
try:
    from .configFile import ConfigFile
    from .localConfigFile import LocalConfigFile
    from .messages import *
except ImportError:
    from configFile import ConfigFile
    from localConfigFile import LocalConfigFile
    from messages import *


class AndruavMessageParserBase(ABC):
    """
    Python equivalent of C++ CAndruavMessageParserBase class.
    Abstract base class for parsing Andruav messages.
    """
    
    def __init__(self):
        self._is_binary = False
        self._is_system = False
        self._is_inter_module = False
        self._facade = None  # Will be set by subclass
    
    def parse_message(self, andruav_message: Dict[str, Any], full_message: Union[str, bytes], full_message_length: int):
        """
        Parse incoming Andruav message
        """
        message_type = andruav_message.get(ANDRUAV_PROTOCOL_MESSAGE_TYPE, 0)
        
        # Check if message is binary (doesn't end with '}')
        if isinstance(full_message, bytes):
            self._is_binary = True
        else:
            self._is_binary = not (full_message.endswith('}') or 
                                  (len(full_message) > 1 and full_message[-2] == '}'))
        
        # Get permission if available
        permission = 0
        if self._validate_field(andruav_message, ANDRUAV_PROTOCOL_MESSAGE_PERMISSION, int):
            permission = int(andruav_message[ANDRUAV_PROTOCOL_MESSAGE_PERMISSION])
        
        # Check if message is from system
        self._is_system = False
        if (self._validate_field(andruav_message, ANDRUAV_PROTOCOL_SENDER, str) and
            andruav_message[ANDRUAV_PROTOCOL_SENDER] == ANDRUAV_PROTOCOL_SENDER_COMM_SERVER):
            self._is_system = True
        
        # Check if message is inter-module
        self._is_inter_module = False
        if (self._validate_field(andruav_message, INTERMODULE_ROUTING_TYPE, str) and
            andruav_message[INTERMODULE_ROUTING_TYPE] == CMD_TYPE_INTERMODULE):
            self._is_inter_module = True
        
        # Handle RemoteExecute messages
        if message_type == TYPE_AndruavMessage_RemoteExecute:
            self.parse_remote_execute(andruav_message)
            return
        
        # Parse default commands and custom commands
        self._parse_default_command(andruav_message, full_message, full_message_length, message_type, permission)
        self.parse_command(andruav_message, full_message, full_message_length, message_type, permission)
    
    def _parse_default_command(self, andruav_message: Dict[str, Any], full_message: Union[str, bytes], 
                              full_message_length: int, message_type: int, permission: int):
        """
        Parse default commands that are common across all modules
        """
        cmd = andruav_message.get(ANDRUAV_PROTOCOL_MESSAGE_CMD, {})
        
        if message_type == TYPE_AndruavMessage_CONFIG_ACTION:
            self._handle_config_action(andruav_message, cmd)
    
    def _handle_config_action(self, andruav_message: Dict[str, Any], cmd: Dict[str, Any]):
        """
        Handle configuration action commands
        """
        module_key = ""
        
        # Validate action field
        if not self._validate_field(cmd, "a", int):
            return
        
        # Check module key if specified
        if self._validate_field(cmd, "b", str):
            module_key = self._get_module_key()
            if module_key != cmd["b"]:
                return
        
        action = cmd["a"]
        
        if action == CONFIG_ACTION_Restart:
            exit(0)
        
        elif action == CONFIG_ACTION_APPLY_CONFIG:
            config = cmd.get("c", {})
            print(config)
            config_file = ConfigFile.get_instance()
            config_file.update_json(json.dumps(config))
        
        elif action == CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE:
            if ANDRUAV_PROTOCOL_SENDER not in andruav_message:
                return
            
            sender = andruav_message[ANDRUAV_PROTOCOL_SENDER]
            
            print(f"\n\033[96mCONFIG_REQUEST_FETCH_CONFIG_TEMPLATE\033[0m")
            
            try:
                with open("template.json", 'r') as file:
                    file_content = file.read()
                    file_content_json = json.loads(file_content)
                    self._facade.api_send_config_template(sender, module_key, file_content_json, True)
            except (IOError, json.JSONDecodeError):
                print(f"\n\033[1;91mcannot read template.json\033[0m")
                if self._facade:
                    self._facade.send_error_message("", 0, ERROR_3DR, 
                                                 NOTIFICATION_TYPE_ERROR, "cannot read template.json")
                    empty_file_content_json = {}
                    self._facade.api_send_config_template(sender, module_key, empty_file_content_json, True)
                return
        
        elif action == CONFIG_REQUEST_FETCH_CONFIG:
            # Implementation for fetching current config
            pass
        
        # Add other config actions as needed
    
    def _validate_field(self, json_obj: Dict[str, Any], field_name: str, expected_type: type) -> bool:
        """
        Validate if a field exists and has the expected type
        """
        return (field_name in json_obj and 
                isinstance(json_obj[field_name], expected_type))
    
    def _get_module_key(self) -> str:
        """
        Get module key - should be implemented by subclass or injected dependency
        """
        # This would typically come from a module instance
        # For now, return empty string
        return ""
    
    @property
    def is_binary(self) -> bool:
        """Check if message is binary"""
        return self._is_binary
    
    @property
    def is_system(self) -> bool:
        """Check if message is from system"""
        return self._is_system
    
    @property
    def is_inter_module(self) -> bool:
        """Check if message is inter-module"""
        return self._is_inter_module
    
    @abstractmethod
    def parse_remote_execute(self, andruav_message: Dict[str, Any]):
        """
        Parse remote execute commands - must be implemented by subclass
        """
        pass
    
    @abstractmethod
    def parse_command(self, andruav_message: Dict[str, Any], full_message: Union[str, bytes], 
                    full_message_length: int, message_type: int, permission: int):
        """
        Parse custom commands - must be implemented by subclass
        """
        pass


# Export the class for compatibility with C++ naming convention
CAndruavMessageParserBase = AndruavMessageParserBase
