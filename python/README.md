# DroneEngage Python Databus

Python implementation of the DroneEngage de_common/de_databus C++ modules.

## Overview

This package provides Python equivalents of the following C++ classes:

- `configFile.hpp/cpp` → `configFile.py` (ConfigFile class)
- `localConfigFile.hpp/cpp` → `localConfigFile.py` (LocalConfigFile class)  
- `de_message_parser_base.hpp/cpp` → `de_message_parser_base.py` (AndruavMessageParserBase class)
- `de_facade_base.hpp/cpp` → `facade_base.py` (FacadeBase class)
- `nodejs/client.js` → `python_client.py` (Python client module)

## Features

- **Singleton Pattern**: All configuration classes follow the singleton pattern
- **JSON Configuration**: Full JSON parsing and manipulation with C-style comment support
- **UDP Communication**: UDP-based messaging system compatible with the C++ implementation
- **Message Parsing**: Complete message parsing with support for binary/text detection
- **Configuration Management**: File monitoring, backup creation, and hot-reloading
- **Error Handling**: Comprehensive error handling with colored console output

## Installation

```bash
cd /home/mhefny/TDisk/public_versions/drone_engage/de_databus/python
pip install -e .
```

## Usage

### As a Python Package

```python
from de_databus import ConfigFile, LocalConfigFile, UDPModule, Messages

# Configuration management
config = ConfigFile.get_instance()
config.init_config_file("config.json")

# UDP communication
module = UDPModule()
module.define_module("gen", "MyModule", "123456789012", "1.0.0", [])
module.init("0.0.0.0", 60000, "0.0.0.0", 61111, 8192)
```

### As a Standalone Client

```bash
python python_client.py MyPythonModule 60000 61111
```

## Class Equivalents

| C++ Class | Python Class | Description |
|-----------|--------------|-------------|
| `CConfigFile` | `ConfigFile` | Main configuration file management |
| `CLocalConfigFile` | `LocalConfigFile` | Local configuration with field operations |
| `CAndruavMessageParserBase` | `AndruavMessageParserBase` | Abstract message parser |
| `CFacade_Base` | `FacadeBase` | Facade for high-level operations |
| `CModule` | `UDPModule` | UDP communication module |

## Key Differences from C++ Implementation

1. **Memory Management**: Python handles memory automatically
2. **File System**: Uses `os.path` and `shutil` instead of `std::filesystem`
3. **JSON Parsing**: Uses Python's built-in `json` module
4. **Threading**: Uses Python's `threading` module for concurrent operations
5. **Signal Handling**: Python's signal module for graceful shutdown
6. **Console Colors**: ANSI escape codes instead of platform-specific implementations

## Configuration File Support

Both `ConfigFile` and `LocalConfigFile` support:

- JSON parsing with C-style comments (`//` and `/* */`)
- File monitoring and hot-reloading
- Automatic backup creation with timestamps
- Field-specific operations (string, numeric, double)
- Template-based configuration management

## Message Protocol

The implementation supports the full Andruav message protocol including:

- Message type detection
- Binary/text message identification
- Permission-based routing
- Inter-module communication
- System message handling
- Configuration actions

## Error Handling

Comprehensive error handling with colored console output:

- Success messages (green)
- Info messages (cyan)  
- Warning messages (yellow)
- Error messages (red)

## Thread Safety

All singleton classes are thread-safe and can be used in multi-threaded applications.

## Dependencies

- Python 3.7+
- Standard library only (no external dependencies)

## Compatibility

This implementation is designed to be fully compatible with the existing C++ DroneEngage system and can communicate with C++ modules over UDP without any modifications.
