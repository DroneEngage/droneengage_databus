"""
Python implementation of de_common/de_databus/de_facade_base.hpp/cpp
Equivalent to C++ CFacade_Base class
"""

import json
from typing import Dict, Any, Union
try:
    from .messages import *
except ImportError:
    from messages import *


class FacadeBase:
    """
    Python equivalent of C++ CFacade_Base class.
    Singleton pattern for facade operations.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FacadeBase, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._module = None  # Will be injected or set by subclass
            FacadeBase._initialized = True
    
    @classmethod
    def get_instance(cls) -> 'FacadeBase':
        """Get singleton instance"""
        return cls()
    
    def set_module(self, module):
        """Set module reference"""
        self._module = module
    
    def request_id(self, target_party_id: str):
        """
        Request ID from target party
        """
        message = {
            "C": TYPE_AndruavMessage_ID
        }
        
        if self._module:
            self._module.send_jmsg(target_party_id, message, TYPE_AndruavMessage_RemoteExecute, True)
        
        return
    
    def send_error_message(self, target_party_id: str, error_number: int, info_type: int, 
                          notification_type: int, description: str):
        """
        Send error message
        EN: error number "not currently processed".
        IT: info type indicate what component is reporting the error.
        NT: severity and compliant with ardupilot.
        DS: description message.
        """
        message = {
            "EN": error_number,
            "IT": info_type,
            "NT": notification_type,
            "DS": description
        }
        
        if self._module:
            self._module.send_jmsg(target_party_id, message, TYPE_AndruavMessage_Error, False)
        
        print(f"\n\033[92m -- sendErrorMessage \033[0m{description}")
        
        return
    
    def api_send_config_template(self, target_party_id: str, module_key: str, 
                                json_file_content_json: Dict[str, Any], reply: bool):
        """
        Send configuration template
        """
        # Create JSON message
        message = {
            "a": CONFIG_STATUS_FETCH_CONFIG_TEMPLATE,
            "b": json_file_content_json,
            "k": module_key,
            "R": reply
        }
        
        # Send command
        if self._module:
            self._module.send_jmsg(target_party_id, message, TYPE_AndruavMessage_CONFIG_STATUS, False)
        
        print(f"\n\033[96mAPI_sendConfigTemplate: module_key:{module_key}\033[0m")
        print(f"\n\033[96mAPI_sendConfigTemplate: json_file_content_json:{json.dumps(json_file_content_json)}\033[0m")
        
        return


# Export the class for compatibility with C++ naming convention
CFacade_Base = FacadeBase
