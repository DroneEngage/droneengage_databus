"""
Python implementation of de_common/de_databus/configFile.hpp/cpp
Equivalent to C++ CConfigFile class
"""

import json
import os
import shutil
import time
from datetime import datetime
from typing import Dict, Any
import io


class ConfigFile:
    """
    Python equivalent of C++ CConfigFile class.
    Singleton pattern for configuration file management with JSON parsing and file monitoring.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigFile, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._file_url = ""
            self._file_contents = io.StringIO()
            self._config_json = {}
            self._last_write_time = 0
            ConfigFile._initialized = True
    
    @classmethod
    def get_instance(cls) -> 'ConfigFile':
        """Get singleton instance"""
        return cls()
    
    def get_config_json(self) -> Dict[str, Any]:
        """Get the configuration JSON data"""
        return self._config_json
    
    def init_config_file(self, file_url: str):
        """Initialize configuration file"""
        self._file_url = file_url
        self._read_file(file_url)
        self._parse_data(self._file_contents.getvalue())
        
        try:
            self._last_write_time = os.path.getmtime(file_url)
            print(f"\033[96mInitial last write time obtained.\033[0m")
        except OSError as e:
            print(f"\033[1;91mError: Could not get initial file write time for '{file_url}': {e}\033[0m")
    
    def reload_file(self):
        """Reload the configuration file"""
        self._read_file(self._file_url)
        self._parse_data(self._file_contents.getvalue())
        
        try:
            self._last_write_time = os.path.getmtime(self._file_url)
        except OSError as e:
            print(f"\033[1;91mError: Could not update file write time after reload for '{self._file_url}': {e}\033[0m")
    
    def file_updated(self) -> bool:
        """Check if file has been updated"""
        if not self._file_url:
            print(f"\033[1;91mError: File URL is empty.\033[0m")
            return False
        
        if not os.path.exists(self._file_url):
            print(f"\033[1;91mError: Config file does not exist: {self._file_url}\033[0m")
            return False
        
        try:
            last_write_time = os.path.getmtime(self._file_url)
            if last_write_time == self._last_write_time:
                return False
            
            self._last_write_time = last_write_time
            print(f"\033[96mFile updated detected.\033[0m")
            return True
        except OSError as e:
            print(f"\033[1;91mError: Could not get file write time for '{self._file_url}': {e}\033[0m")
            return False
    
    def get_file_name(self) -> str:
        """Get the file name/path"""
        return self._file_url
    
    def update_json(self, json_string: str):
        """Update JSON configuration with new data"""
        try:
            update_json = json.loads(self._remove_comments(json_string))
            for key, value in update_json.items():
                self._config_json[key] = value
                print(f"\033[96mUpdated/Added JSON key: {key}\033[0m")
            self.save_config_file()
        except json.JSONDecodeError as e:
            print(f"\033[1;91mError: Failed to parse update JSON: {e}\033[0m")
            return
    
    def save_config_file(self):
        """Save configuration to file with backup"""
        # Create backup if file exists
        if os.path.exists(self._file_url):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_url = f"{self._file_url}.bak_{timestamp}"
            
            try:
                shutil.copy2(self._file_url, backup_url)
                print(f"\033[96mBackup created: {backup_url}\033[0m")
            except OSError as e:
                print(f"\033[1;91mError: Could not create backup file '{backup_url}': {e}\033[0m")
        
        try:
            with open(self._file_url, 'w') as outfile:
                json.dump(self._config_json, outfile, indent=4)
            print(f"\033[92mConfig file saved successfully: {self._file_url}\033[0m")
            
            self._last_write_time = os.path.getmtime(self._file_url)
        except OSError as e:
            print(f"\033[1;91mError: Could not open config file for writing: {self._file_url}\033[0m")
            return
    
    def _read_file(self, file_url: str):
        """Read file contents"""
        print(f"\033[1;94mRead config file: \033[96m{file_url}\033[0m ....", end="")
        
        try:
            with open(file_url, 'r') as stream:
                self._file_contents = io.StringIO(stream.read())
            print(f"\033[92m succeeded\033[0m")
        except IOError:
            print(f"\033[1;91mFATAL ERROR: FAILED to read config file\033[0m")
            exit(1)
    
    def _parse_data(self, json_string: str):
        """Parse JSON data"""
        try:
            self._config_json = json.loads(self._remove_comments(json_string))
            print(f"\033[92mconfig file parsed successfully\033[0m")
        except json.JSONDecodeError as e:
            print(f"\033[1;91mError parsing JSON: {e}\033[0m")
            exit(1)
    
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
CConfigFile = ConfigFile
