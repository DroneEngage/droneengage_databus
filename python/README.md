# DroneEngage Python Databus

Python implementation of the DroneEngage de_common/de_databus C++ modules.

## Overview

This package provides Python equivalents of the following C++ classes:

- `de_module.hpp/cpp` → `de_module.py` (CModule class - main module interface)
- `udpClient.hpp/cpp` → `udpClient.py` (CUDPClient class - UDP communication with chunking)
- `configFile.hpp/cpp` → `configFile.py` (ConfigFile class)
- `localConfigFile.hpp/cpp` → `localConfigFile.py` (LocalConfigFile class)  
- `de_message_parser_base.hpp/cpp` → `de_message_parser_base.py` (AndruavMessageParserBase class)
- `de_facade_base.hpp/cpp` → `de_facade_base.py` (FacadeBase class)
- `nodejs/client.js` → `python_client.py` (Python client module)

## Features

- **Singleton Pattern**: Module and configuration classes follow the singleton pattern
- **JSON Configuration**: Full JSON parsing and manipulation with C-style comment support
- **UDP Communication**: UDP-based messaging system with chunking protocol (compatible with C++ implementation)
- **Message Reassembly**: Automatic chunking and reassembly for large messages (>8KB)
- **Periodic ID Broadcasting**: Automatic module identification broadcasting
- **Binary Message Support**: Full support for binary data transmission (images, etc.)
- **Message Parsing**: Complete message parsing with support for binary/text detection
- **Configuration Management**: File monitoring, backup creation, and hot-reloading
- **Error Handling**: Comprehensive error handling with colored console output
- **Thread Safety**: Mutex-protected operations for concurrent access

## Installation

```bash
cd /home/mhefny/TDisk/public_versions/drone_engage/de_databus/python
pip install -e .
```

## Usage

### As a Python Package

```python
from de_module import CModule
from de_facade_base import CFacade_Base
from messages import *

# Create module instance (singleton)
module = CModule()

# Define module properties
module.defineModule(
    "gen",              # MODULE_CLASS_GENERIC
    "MyPythonModule",   # Module name
    "123456789012",     # Module key (unique ID)
    "1.0.0",           # Version
    []                 # Message filter (empty = receive all)
)

# Add module features
module.add_module_features("T")  # MODULE_FEATURE_SENDING_TELEMETRY
module.add_module_features("R")  # MODULE_FEATURE_RECEIVING_TELEMETRY

# Set hardware info (optional)
module.set_hardware("123456", 1)  # HARDWARE_TYPE_CPU

# Initialize UDP communication
module.init("0.0.0.0", 60000, "0.0.0.0", 61111, 8192)

# Use facade for high-level operations
facade = CFacade_Base()
facade.set_module(module)
facade.send_error_message("", ERROR_USER_DEFINED, NOTIFICATION_TYPE_NOTICE, 
                         NOTIFICATION_TYPE_INFO, "Hello from Python")
```

### As a Standalone Client

```bash
python python_client.py MyPythonModule 60000 61111
```

## Class Equivalents

| C++ Class | Python Class | File | Description |
|-----------|--------------|------|-------------|
| `CModule` | `CModule` | `de_module.py` | Main module interface with message routing |
| `CUDPClient` | `CUDPClient` | `udpClient.py` | UDP communication with chunking protocol |
| `CConfigFile` | `ConfigFile` | `configFile.py` | Main configuration file management |
| `CLocalConfigFile` | `LocalConfigFile` | `localConfigFile.py` | Local configuration with field operations |
| `CAndruavMessageParserBase` | `AndruavMessageParserBase` | `de_message_parser_base.py` | Abstract message parser |
| `CFacade_Base` | `FacadeBase` (exported as `CFacade_Base`) | `de_facade_base.py` | Facade for high-level operations |

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

## Architecture

### Module Hierarchy

```
CModule (de_module.py)
  ├── CUDPClient (udpClient.py)
  │   ├── UDP Socket Management
  │   ├── Message Chunking (send)
  │   ├── Message Reassembly (receive)
  │   └── Periodic ID Broadcasting
  └── Message Routing
      ├── sendJMSG() - JSON messages
      ├── sendBMSG() - Binary messages
      ├── sendSYSMSG() - System messages
      └── onReceive() - Message handler
```

### UDP Chunking Protocol

The implementation uses the same chunking protocol as C++:

- **Chunk Header**: 2 bytes (chunk number, little-endian)
- **Chunk Data**: Up to 8190 bytes (configurable)
- **First Chunk**: Chunk number = 0
- **Last Chunk**: Chunk number = 0xFFFF
- **Reassembly**: Automatic concatenation of chunks

This allows sending messages larger than the UDP packet size limit.

## Message Protocol

The implementation supports the full Andruav message protocol including:

- **Message Routing Types**:
  - `CMD_TYPE_INTERMODULE` - Inter-module communication
  - `CMD_COMM_GROUP` - Broadcast to group
  - `CMD_COMM_INDIVIDUAL` - Direct to specific party
  - `CMD_COMM_SYSTEM` - System-level messages

- **Message Types**:
  - JSON messages (TYPE_AndruavMessage_*)
  - Binary messages (images, video, etc.)
  - System messages (TYPE_AndruavSystem_*)
  - Module messages (TYPE_AndruavModule_*)

- **Protocol Features**:
  - Message type detection
  - Binary/text message identification
  - Permission-based routing
  - Inter-module communication
  - System message handling
  - Configuration actions
  - Party ID and Group ID management

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

## API Methods

### CModule Methods

- `defineModule(module_class, module_id, module_key, version, message_filter)` - Define module properties
- `init(target_ip, target_port, listen_ip, listen_port, packet_size)` - Initialize UDP communication
- `uninit()` - Cleanup and shutdown
- `sendJMSG(target_party_id, message, message_type, internal_message)` - Send JSON message
- `sendBMSG(target_party_id, bmsg, bmsg_length, message_type, internal_message, message_cmd)` - Send binary message
- `sendSYSMSG(message, message_type)` - Send system message
- `sendMREMSG(command_type)` - Send module remote execute message
- `add_module_features(feature)` - Add module feature flag
- `set_hardware(hardware_id, hardware_type)` - Set hardware identification

### CFacade_Base Methods

- `set_module(module)` - Inject module reference
- `send_error_message(target_party_id, error_number, info_type, notification_type, description)` - Send error/notification
- `request_id(target_party_id)` - Request ID from target party
- `api_send_config_template(target_party_id, module_key, json_content, reply)` - Send config template

## Important Notes

1. **Method Naming**: Python implementation uses the same naming as C++ (e.g., `sendJMSG`, `defineModule`) for consistency
2. **Constants**: All protocol constants are defined in `messages.py` - use these instead of hardcoded strings
3. **Thread Safety**: CModule and CUDPClient use mutex locks for thread-safe operations
4. **Singleton Pattern**: CModule and CUDPClient are singletons - multiple instantiations return the same instance
5. **Message Filter**: Empty array `[]` means receive all messages; specify message types to filter

## Compatibility

This implementation is designed to be fully compatible with the existing C++ DroneEngage system and can communicate with C++ modules over UDP without any modifications.

### Protocol Compatibility

- ✅ UDP chunking protocol matches C++ implementation
- ✅ Message format (JSON with protocol fields) identical
- ✅ Binary message format (JSON header + null + binary data) identical
- ✅ Module identification and registration protocol identical
- ✅ All message type constants match C++ definitions
