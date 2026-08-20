import re
import json
import os
import shutil
from datetime import datetime

def _remove_comments(content):
    # Remove C-style comments (/* ... */)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    # Remove C++-style comments (//)
    content = re.sub(r'//.*?$', '', content, flags=re.MULTILINE)

    return content


class ConfigFile:

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ConfigFile, cls).__new__(cls)
        return cls._instance

    def __init__(self, file_name=None):
        self.file_name = file_name
        self.config = {}
        self._last_write_time = 0
        if file_name is not None:
            self.config = self.load_config()
            try:
                self._last_write_time = os.path.getmtime(file_name)
            except OSError:
                pass

    def load_config(self):
        with open(self.file_name, 'r') as f:
            content = f.read()
            return json.loads(_remove_comments(content))

    def get_value(self, key):
        return self.config[key]

    def reload_config(self):
        self.config = self.load_config()

    # --- Backward-compatibility methods (old singleton-style API) ---

    @classmethod
    def get_instance(cls):
        """Get singleton instance (old API)."""
        return cls()

    def init_config_file(self, file_url):
        """Initialize configuration file (old API)."""
        self.file_name = file_url
        self.config = self.load_config()
        try:
            self._last_write_time = os.path.getmtime(file_url)
        except OSError:
            pass

    def get_config_json(self):
        """Get the configuration JSON data (old API)."""
        return self.config

    def update_json(self, json_string):
        """Update JSON configuration (old API, delegates to updateJSON)."""
        self.updateJSON(json_string)

    def reload_file(self):
        """Reload the configuration file (old API, delegates to reload_config)."""
        self.reload_config()
        try:
            self._last_write_time = os.path.getmtime(self.file_name)
        except OSError:
            pass

    def file_updated(self):
        """Check if file has been updated since last read (old API)."""
        if not self.file_name:
            return False
        if not os.path.exists(self.file_name):
            return False
        try:
            mtime = os.path.getmtime(self.file_name)
            if mtime == self._last_write_time:
                return False
            self._last_write_time = mtime
            return True
        except OSError:
            return False

    def updateJSON(self, json_string):
        """
        Shallow-merges (or nested-merges via dotted keys, e.g. "follow_me.quad.PID_P_X")
        the given JSON string into the current config and persists it to disk.
        Mirrors de::CConfigFile::updateJSON (C++ de_common/configFile.cpp).
        """
        try:
            update_json = json.loads(_remove_comments(json_string)) if isinstance(json_string, str) else json_string
        except (TypeError, ValueError) as e:
            print(f"Error: Failed to parse update JSON: {e}")
            return

        if not isinstance(update_json, dict):
            return

        for key, value in update_json.items():
            if '.' in key:
                path_parts = [part for part in key.split('.') if part]
                if not path_parts:
                    print(f"Error: Invalid key format: {key}")
                    continue

                current_node = self.config
                for part in path_parts[:-1]:
                    if part not in current_node or not isinstance(current_node[part], dict):
                        current_node[part] = {}
                    current_node = current_node[part]

                current_node[path_parts[-1]] = value
                print(f"Updated/Added nested JSON key: {key}")
            else:
                self.config[key] = value
                print(f"Updated/Added JSON key: {key}")

        self.saveConfigFile()

    def saveConfigFile(self):
        if os.path.exists(self.file_name):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_url = f"{self.file_name}.bak_{timestamp}"
            try:
                shutil.copy2(self.file_name, backup_url)
                print(f"Backup created: {backup_url}")
            except OSError as e:
                print(f"Error: Could not create backup file '{backup_url}': {e}")

        try:
            with open(self.file_name, 'w') as f:
                json.dump(self.config, f, indent=4)
            print(f"Config file saved successfully: {self.file_name}")
        except OSError as e:
            print(f"Error: Could not open config file for writing: {self.file_name}: {e}")


# Export the class for compatibility with C++ naming convention
CConfigFile = ConfigFile
