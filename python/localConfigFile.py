"""
Python implementation of de_common/de_databus/localConfigFile.hpp/cpp
Equivalent to C++ CLocalConfigFile class
"""

import json
import os
from typing import Dict, Any, Union
import io


class LocalConfigFile:
    """
    Python equivalent of C++ CLocalConfigFile class.
    Singleton pattern for local configuration file management with field-specific operations.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalConfigFile, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._file_url = ""
            self._file_contents = io.StringIO()
            self._config_json = {}
            LocalConfigFile._initialized = True
    
    @classmethod
    def get_instance(cls) -> 'LocalConfigFile':
        """Get singleton instance"""
        return cls()
    
    def get_config_json(self) -> Dict[str, Any]:
        """Get the configuration JSON data"""
        return self._config_json
    
    def init_config_file(self, file_url: str):
        """Initialize local configuration file"""
        self._config_json = {}
        self._file_url = file_url
        self._read_file(file_url)
        self._parse_data(self._file_contents.getvalue())
    
    def apply(self):
        """Apply changes by writing to file"""
        self._write_file(self._file_url)
    
    def clear_file(self):
        """Clear the configuration file"""
        self._config_json = {}
        self._write_file(self._file_url)
    
    def get_string_field(self, field: str) -> str:
        """Get string field value"""
        if field not in self._config_json:
            return ""
        return str(self._config_json[field])
    
    def add_string_field(self, field: str, value: str):
        """Add string field"""
        self._config_json[field] = value
    
    def modify_string_field(self, field: str, new_value: str):
        """Modify or add string field"""
        if field in self._config_json:
            self._config_json[field] = new_value
            print(f"\033[1;94mModified string field: \033[92m{field}\033[0m")
        else:
            self._config_json[field] = new_value
            print(f"\033[1;94mAdded new string field: \033[96m{field}\033[0m (field did not exist)")
    
    def get_numeric_field(self, field: str) -> int:
        """Get numeric field value"""
        if field not in self._config_json:
            return 0xffffffff
        return int(self._config_json[field])
    
    def add_numeric_field(self, field: str, value: int):
        """Add numeric field"""
        self._config_json[field] = value
    
    def modify_numeric_field(self, field: str, new_value: int):
        """Modify or add numeric field"""
        if field in self._config_json:
            self._config_json[field] = new_value
            print(f"\033[1;94mModified numeric field: \033[92m{field}\033[0m")
        else:
            self._config_json[field] = new_value
            print(f"\033[1;94mAdded new numeric field: \033[96m{field}\033[0m (field did not exist)")
    
    def get_double_field(self, field: str) -> float:
        """Get double field value"""
        if field not in self._config_json:
            print(f"\033[96mDouble field '{field}' not found.\033[0m")
            return 0.0
        
        value = self._config_json[field]
        if not isinstance(value, (int, float)):
            print(f"\033[91mField '{field}' is not a number.\033[0m")
            return 0.0
        
        return float(value)
    
    def add_double_field(self, field: str, value: float):
        """Add double field"""
        self._config_json[field] = value
    
    def modify_double_field(self, field: str, new_value: float):
        """Modify or add double field"""
        if field in self._config_json:
            self._config_json[field] = new_value
            print(f"\033[1;94mModified double field: \033[92m{field}\033[0m")
        else:
            self._config_json[field] = new_value
            print(f"\033[1;94mAdded new double field: \033[96m{field}\033[0m (field did not exist)")
    
    def remove_field_by_name(self, field_name: str):
        """Remove field by name"""
        if field_name in self._config_json:
            del self._config_json[field_name]
            print(f"\033[96mRemoved field: \033[92m{field_name}\033[0m")
        else:
            print(f"\033[1;94mField not found: \033[96m{field_name}\033[0m")
    
    def _write_file(self, file_url: str):
        """Write configuration to file"""
        print(f"\033[1;94mWrite internal config file: \033[92m{file_url}\033[0m ....", end="")
        
        try:
            with open(file_url, 'w', truncating=True) as stream:
                json.dump(self._config_json, stream)
            print(f"\033[92m succeeded\033[0m")
        except IOError:
            print(f"\033[91m FAILED\033[0m")
            exit(1)
    
    def _read_file(self, file_url: str):
        """Read configuration from file"""
        print(f"\033[1;94mRead internal config file: \033[96m{file_url}\033[0m ....", end="")
        
        try:
            with open(file_url, 'r') as stream:
                content = stream.read()
                self._file_contents = io.StringIO(content)
            print(f"\033[92m succeeded\033[0m")
        except IOError:
            print(f"\033[96m trying to create one\033[0m")
            self._write_file(file_url)
            self._file_contents = io.StringIO(json.dumps(self._config_json))
            return
    
    def _parse_data(self, json_string: str) -> bool:
        """Parse JSON data"""
        try:
            self._config_json = json.loads(self._remove_comments(json_string))
            return True
        except json.JSONDecodeError as e:
            print(f"\033[91m{e}\033[0m")
            return False
    
    def _remove_comments(self, json_string: str) -> str:
        """Remove C-style comments from JSON string"""
        lines = json_string.split('\n')
        cleaned_lines = []
        in_multiline_comment = False
        
        for line in lines:
            i = 0
            while i < len(line):
                if not in_multiline_comment:
                    if i + 1 < len(line) and line[i:i+2] == '/*':
                        in_multiline_comment = True
                        i += 2
                    elif i + 1 < len(line) and line[i:i+2] == '//':
                        break  # Skip rest of line
                    else:
                        i += 1
                else:
                    if i + 1 < len(line) and line[i:i+2] == '*/':
                        in_multiline_comment = False
                        i += 2
                    else:
                        i += 1
            
            if not in_multiline_comment:
                # Remove single-line comments
                if '//' in line:
                    line = line[:line.index('//')]
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)


# Export the class for compatibility with C++ naming convention
CLocalConfigFile = LocalConfigFile
