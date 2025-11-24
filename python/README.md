# DroneEngage DataBus - Python Client Library

Python implementation of the DroneEngage DataBus communication protocol for building custom modules that integrate with the DroneEngage system.

## Overview

This library provides a Python interface to the DroneEngage DataBus, implementing the same UDP-based communication protocol as the C++ version. It enables Python applications to:

- **Register as DroneEngage modules** with the communicator server
- **Send and receive JSON messages** with automatic routing
- **Transmit binary data** (images, files, etc.)
- **Handle chunked UDP transmission** for large messages
- **Automatic message reassembly** on reception
- **Periodic module identification** broadcasting

For detailed protocol information, see [../client/src/de_common/README.md](../client/src/de_common/README.md)

## Architecture

The library consists of several key components:

```
┌─────────────────────┐
│  Your Application   │
│  (client.py)        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CFacade_Base       │  ← High-level API
│  (de_facade_base.py)│
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CModule            │  ← Module management & routing
│  (de_module.py)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CUDPClient         │  ← UDP transport with chunking
│  (udpClient.py)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  de_comm            │  ← DroneEngage Communicator
│  (Port 60000)       │
└─────────────────────┘
```

## Files Description

### Core Library Files

- **`de_module.py`** - Main module class implementing DroneEngage protocol
- **`udpClient.py`** - UDP client with chunking and reassembly
- **`de_facade_base.py`** - High-level facade API for common operations
- **`messages.py`** - Message type constants and protocol definitions
- **`colors.py`** - Console color formatting utilities

### Example Files

- **`client.py`** - Basic example demonstrating module registration and messaging

## Prerequisites

### Python Version
- **Python 3.6+** (uses f-strings and type hints)

### Dependencies

```bash
pip install colorama
```

**Required packages:**
- `colorama` - For colored console output

**Standard library modules used:**
- `socket` - UDP networking
- `threading` - Concurrent execution
- `json` - JSON serialization
- `time` - Timing and delays
- `random` - Random ID generation

## Installation

1. Clone or copy the Python library files to your project
2. Install dependencies:
   ```bash
   pip install colorama
   ```

## Quick Start

### Basic Module Example

```python
import sys
import json
import random
from de_module import *
from de_facade_base import *

DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192

# Create module singleton instance
cModule = CModule()

# Create facade for high-level operations
my_facade = MyFacade(cModule)

# Generate random module ID
def generate_random_module_id():
    return ''.join(random.choice('0123456789') for _ in range(12))

# Define module
cModule.defineModule(
    MODULE_CLASS_GENERIC,      # Module class
    "PY_Module",               # Module name
    generate_random_module_id(), # Unique ID
    "0.0.1",                   # Version
    []                         # Message filter (empty = no filtering)
)

# Add module features
cModule.add_module_features(MODULE_FEATURE_SENDING_TELEMETRY)
cModule.add_module_features(MODULE_FEATURE_RECEIVING_TELEMETRY)

# Set hardware info (optional)
cModule.set_hardware("123456", HARDWARE_TYPE_CPU)

# Initialize connection
cModule.init(
    "0.0.0.0",                          # Server IP
    60000,                              # Broker port
    "0.0.0.0",                          # Listen IP
    61111,                              # Listen port (unique)
    DEFAULT_UDP_DATABUS_PACKET_SIZE     # Max packet size
)

# Send a message
my_facade.sendErrorMessage(
    "",                          # Target (empty = broadcast)
    ERROR_USER_DEFINED,          # Error number
    NOTIFICATION_TYPE_INFO,      # Notification type
    NOTIFICATION_TYPE_INFO,      # Info type
    "Hello from Python!"         # Message
)

# Keep running
while True:
    time.sleep(1)
```

## API Reference

### CModule Class

The main class for module management and communication.

#### Initialization Methods

```python
# Define module identity
defineModule(module_class, module_id, module_key, module_version, message_filter)
```

**Parameters:**
- `module_class` - Module type (e.g., `MODULE_CLASS_GENERIC`)
- `module_id` - Display name for the module
- `module_key` - Unique identifier string
- `module_version` - Version string (e.g., "0.0.1")
- `message_filter` - List of message types to receive (empty list = all)

```python
# Initialize UDP connection
init(target_ip, broadcasts_port, host, listening_port, chunk_size)
```

**Parameters:**
- `target_ip` - Communicator server IP (use "0.0.0.0" for localhost)
- `broadcasts_port` - Communicator port (typically 60000)
- `host` - Local bind address (use "0.0.0.0")
- `listening_port` - Local port for receiving (must be unique per module)
- `chunk_size` - Maximum UDP packet size (use `DEFAULT_UDP_DATABUS_PACKET_SIZE`)

```python
# Add module features
add_module_features(feature)
```

**Features:**
- `MODULE_FEATURE_RECEIVING_TELEMETRY` - Can receive telemetry
- `MODULE_FEATURE_SENDING_TELEMETRY` - Can send telemetry
- `MODULE_FEATURE_CAPTURE_IMAGE` - Can capture images
- `MODULE_FEATURE_CAPTURE_VIDEO` - Can capture video

```python
# Set hardware identification
set_hardware(hardware_serial, hardware_serial_type)
```

**Parameters:**
- `hardware_serial` - Hardware serial number string
- `hardware_serial_type` - Hardware type (e.g., `HARDWARE_TYPE_CPU`)

#### Sending Methods

```python
# Send JSON message
sendJMSG(targetPartyID, jmsg, andruav_message_id, internal_message)
```

**Parameters:**
- `targetPartyID` - Destination party ID (empty string = broadcast)
- `jmsg` - Dictionary containing message data
- `andruav_message_id` - Message type constant (from messages.py)
- `internal_message` - Boolean, True for inter-module messages

**Example:**
```python
message = {
    "field1": "value1",
    "field2": 123
}
cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, True)
```

```python
# Send binary message
sendBMSG(targetPartyID, bmsg, bmsg_length, andruav_message_id, internal_message, message_cmd)
```

**Parameters:**
- `targetPartyID` - Destination party ID
- `bmsg` - Binary data (bytes)
- `bmsg_length` - Length of binary data
- `andruav_message_id` - Message type constant
- `internal_message` - Boolean for routing
- `message_cmd` - Dictionary with metadata

**Example:**
```python
with open("image.jpg", "rb") as f:
    image_data = f.read()

metadata = {
    "lat": 0,
    "lng": 0,
    "alt": 0,
    "tim": int(time.time() * 1000000)
}

cModule.sendBMSG("", image_data, len(image_data), 
                 TYPE_AndruavMessage_IMG, False, metadata)
```

#### Receiving Messages

```python
# Set receive callback
cModule.m_OnReceive = callback_function

def callback_function(message, length, jMsg):
    """
    message: Raw message bytes
    length: Message length
    jMsg: Parsed JSON dictionary
    """
    msg_type = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE]
    # Process message based on type
```

#### Cleanup

```python
# Uninitialize and cleanup
uninit()
```

### CFacade_Base Class

High-level API for common operations.

```python
# Create facade instance
facade = CFacade_Base(cModule)
```

#### Methods

```python
# Request ID from target
requestID(target_party_id)
```

```python
# Send error/notification message
sendErrorMessage(target_party_id, error_number, info_type, 
                notification_type, description)
```

**Parameters:**
- `target_party_id` - Target unit (empty = broadcast)
- `error_number` - Error code (e.g., `ERROR_USER_DEFINED`)
- `info_type` - Information type
- `notification_type` - Severity level:
  - `NOTIFICATION_TYPE_EMERGENCY` (0)
  - `NOTIFICATION_TYPE_ALERT` (1)
  - `NOTIFICATION_TYPE_CRITICAL` (2)
  - `NOTIFICATION_TYPE_ERROR` (3)
  - `NOTIFICATION_TYPE_WARNING` (4)
  - `NOTIFICATION_TYPE_NOTICE` (5)
  - `NOTIFICATION_TYPE_INFO` (6)
  - `NOTIFICATION_TYPE_DEBUG` (7)
- `description` - Message text

**Example:**
```python
facade.sendErrorMessage("", ERROR_USER_DEFINED, 
                       NOTIFICATION_TYPE_INFO,
                       NOTIFICATION_TYPE_INFO,
                       "System initialized successfully")
```

### Custom Facade

Extend `CFacade_Base` to add custom methods:

```python
class MyFacade(CFacade_Base):
    def __init__(self, m_module):
        super().__init__(m_module)
    
    def send_custom_telemetry(self, data):
        message = {
            "sensor_data": data,
            "timestamp": time.time()
        }
        self.m_module.sendJMSG("", message, 
                              TYPE_AndruavMessage_DUMMY, False)
```

### CUDPClient Class

Low-level UDP communication (typically not used directly).

**Key Features:**
- Automatic message chunking for large payloads
- Chunk reassembly on reception
- Thread-safe sending with mutex locks
- Periodic ID broadcasting

## Message Types

Common message types from `messages.py`:

### System Messages
- `TYPE_AndruavSystem_Ping` (9005)
- `TYPE_AndruavSystem_ConnectedCommServer` (9007)

### Inter-Module Messages
- `TYPE_AndruavModule_ID` (9100)
- `TYPE_AndruavModule_RemoteExecute` (9101)

### Andruav Messages
- `TYPE_AndruavMessage_ID` (1004)
- `TYPE_AndruavMessage_RemoteExecute` (1005)
- `TYPE_AndruavMessage_IMG` (1006)
- `TYPE_AndruavMessage_Error` (1008)
- `TYPE_AndruavMessage_GPS` (1002)
- `TYPE_AndruavMessage_POWER` (1003)
- `TYPE_AndruavMessage_MAVLINK` (6502)
- `TYPE_AndruavMessage_DUMMY` (9999)

### Custom Messages
- `TYPE_AndruavMessage_USER_RANGE_START` (80000) to `TYPE_AndruavMessage_USER_RANGE_END` (90000)

Use custom message types for application-specific communication:
```python
TYPE_MY_CUSTOM_MESSAGE = TYPE_AndruavMessage_USER_RANGE_START + 1
```

## Module Classes

Available module classes:

- `MODULE_CLASS_COMM` - Communication module
- `MODULE_CLASS_FCB` - Flight control board
- `MODULE_CLASS_VIDEO` - Camera/video module
- `MODULE_CLASS_P2P` - Peer-to-peer module
- `MODULE_CLASS_GENERIC` - Generic module (most common)

## Complete Example: client.py

```python
import sys
import json
import random
import time
from de_module import *
from de_facade_base import *
from colors import *
from messages import *

DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192

# Create module singleton
cModule = CModule()

# Create facade
my_facade = MyFacade(cModule)

def generate_random_module_id():
    return ''.join(random.choice('0123456789') for _ in range(12))

def send_msg():
    my_facade.sendErrorMessage(
        "",
        ERROR_USER_DEFINED,
        NOTIFICATION_TYPE_INFO,
        NOTIFICATION_TYPE_INFO,
        "Hello from Python"
    )

if __name__ == "__main__":
    print(INFO_CONSOLE_BOLD_TEXT + "Python DroneEngage Module" + NORMAL_CONSOLE_TEXT)
    print(SUCCESS_CONSOLE_BOLD_TEXT + "Usage: python client.py MODULE_NAME BROKER_PORT LISTEN_PORT" + NORMAL_CONSOLE_TEXT)
    print(INFO_CONSOLE_BOLD_TEXT + "Example: python client.py PY_Plugin 60000 61233" + NORMAL_CONSOLE_TEXT)
    
    if len(sys.argv) < 4:
        print(ERROR_CONSOLE_BOLD_TEXT + "Insufficient arguments!" + NORMAL_CONSOLE_TEXT)
        sys.exit(1)
    
    module_name = sys.argv[1]
    target_port = int(sys.argv[2])
    listen_port = int(sys.argv[3])
    module_id = generate_random_module_id()
    
    print(INFO_CONSOLE_TEXT + "Initializing module..." + NORMAL_CONSOLE_TEXT)
    
    # Define module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_name,
        module_id,
        "0.0.1",
        []  # Empty filter = receive all messages
    )
    
    # Add features
    cModule.add_module_features(MODULE_FEATURE_SENDING_TELEMETRY)
    cModule.add_module_features(MODULE_FEATURE_RECEIVING_TELEMETRY)
    
    # Set hardware info
    cModule.set_hardware("123456", HARDWARE_TYPE_CPU)
    
    # Initialize connection
    cModule.init("0.0.0.0", target_port, "0.0.0.0", listen_port, 
                DEFAULT_UDP_DATABUS_PACKET_SIZE)
    
    print(SUCCESS_CONSOLE_BOLD_TEXT + "Module running!" + NORMAL_CONSOLE_TEXT)
    
    # Main loop
    while True:
        time.sleep(1)
        print("Module RUNNING")
        send_msg()
```

## Running the Example

```bash
# Start DroneEngage communicator (typically on port 60000)

# Run Python module
python client.py MyPythonModule 60000 61233
```

The module will:
1. Connect to the communicator on port 60000
2. Listen for messages on port 61233
3. Appear in the WebClient Details tab
4. Send periodic "Hello from Python" messages

## Message Filtering

Subscribe to specific message types for efficiency:

```python
# Filter for specific messages
message_filter = [
    TYPE_AndruavMessage_GPS,
    TYPE_AndruavMessage_POWER,
    TYPE_AndruavMessage_MAVLINK
]

cModule.defineModule(
    MODULE_CLASS_GENERIC,
    "GPS_Monitor",
    module_id,
    "0.0.1",
    message_filter  # Only receive these types
)
```

## Receiving Messages

Implement a callback to handle incoming messages:

```python
def on_receive(message, length, jMsg):
    """
    Callback for received messages
    
    Args:
        message: Raw message bytes
        length: Message length
        jMsg: Parsed JSON dictionary
    """
    try:
        msg_type = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE]
        
        if msg_type == TYPE_AndruavMessage_GPS:
            # Handle GPS message
            cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD]
            lat = cmd.get("lat", 0)
            lng = cmd.get("lng", 0)
            print(f"GPS: {lat}, {lng}")
            
        elif msg_type == TYPE_AndruavMessage_POWER:
            # Handle power message
            cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD]
            voltage = cmd.get("voltage", 0)
            print(f"Battery: {voltage}V")
            
    except Exception as e:
        print(f"Error processing message: {e}")

# Set callback
cModule.m_OnReceive = on_receive
```

## Thread Safety

The library uses thread-safe patterns:

- **Mutex locks** (`threading.Lock()`) protect shared resources
- **RLock** for reentrant locking in `CModule`
- **Separate threads** for receiving and ID broadcasting
- **Thread-safe queue** operations

## Best Practices

1. **Unique Module IDs**: Use `generate_random_module_id()` or hardcoded unique IDs
2. **Unique Listen Ports**: Each module instance needs its own port
3. **Message Filtering**: Subscribe only to needed message types
4. **Error Handling**: Wrap message processing in try-except blocks
5. **Resource Cleanup**: Call `uninit()` before exiting
6. **Singleton Pattern**: `CModule` is a singleton - use the same instance
7. **Rate Limiting**: Add delays between high-frequency messages

## Port Configuration

- **Broker Port**: Typically `60000` (DroneEngage communicator)
- **Module Listen Ports**: Use unique ports for each module
  - Example: 61000-62000 range for custom modules
  - Avoid conflicts with system ports (< 1024)

## Debugging

Enable verbose output by modifying the print statements in the library:

```python
# In udpClient.py, uncomment debug prints
print(f"chunkNumber:{chunk_number} :chunkLength:{chunk_length}")

# In de_module.py
print(f"RX MSG: :len {len}:{message}")
print(f"RX MSG: jMsg{json.dumps(jMsg)}")
```

## Color Output

The library uses `colorama` for colored console output:

```python
from colors import *

print(ERROR_CONSOLE_BOLD_TEXT + "Error message" + NORMAL_CONSOLE_TEXT)
print(SUCCESS_CONSOLE_BOLD_TEXT + "Success!" + NORMAL_CONSOLE_TEXT)
print(INFO_CONSOLE_BOLD_TEXT + "Information" + NORMAL_CONSOLE_TEXT)
print(LOG_CONSOLE_TEXT + "Log entry" + NORMAL_CONSOLE_TEXT)
```

## Comparison with C++ Implementation

| Feature | Python | C++ |
|---------|--------|-----|
| Language | Python 3.6+ | C++17 |
| Threading | `threading` module | `std::thread` |
| JSON | `json` module | nlohmann/json |
| Sockets | `socket` module | POSIX sockets |
| Performance | Good for most use cases | Higher performance |
| Development Speed | Faster prototyping | More verbose |
| Type Safety | Dynamic typing | Static typing |

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Module not appearing in WebClient | Check broker port (60000), ensure communicator is running |
| Port already in use | Change listen port to unused value |
| Messages not received | Verify message type is in message_filter list |
| Import errors | Install colorama: `pip install colorama` |
| Connection refused | Ensure communicator is running before starting module |
| High CPU usage | Add `time.sleep()` in main loop |

## Advanced Usage

### Binary Data Transmission

```python
# Send image file
with open("photo.jpg", "rb") as f:
    image_data = f.read()

metadata = {
    "lat": 31.5,
    "lng": 34.5,
    "alt": 100,
    "tim": int(time.time() * 1000000)
}

cModule.sendBMSG("", image_data, len(image_data),
                TYPE_AndruavMessage_IMG, False, metadata)
```

### Custom Message Types

```python
# Define custom message types
TYPE_SENSOR_DATA = TYPE_AndruavMessage_USER_RANGE_START + 1
TYPE_ACTUATOR_CMD = TYPE_AndruavMessage_USER_RANGE_START + 2

# Send custom message
sensor_data = {
    "temperature": 25.5,
    "humidity": 60.0,
    "pressure": 1013.25
}

cModule.sendJMSG("", sensor_data, TYPE_SENSOR_DATA, False)
```

### Module Features

```python
# Add multiple features
cModule.add_module_features(MODULE_FEATURE_SENDING_TELEMETRY)
cModule.add_module_features(MODULE_FEATURE_RECEIVING_TELEMETRY)
cModule.add_module_features(MODULE_FEATURE_CAPTURE_IMAGE)
cModule.add_module_features(MODULE_FEATURE_CAPTURE_VIDEO)
```

## Testing

### Basic Connection Test

```bash
# Terminal 1: Start DroneEngage communicator
# (Ensure it's running on port 60000)

# Terminal 2: Run Python client
python client.py TestModule 60000 61111
```

Check the WebClient Details tab to verify the module appears.

### Message Exchange Test

Create two modules that communicate:

```python
# sender.py - Sends messages
cModule.sendJMSG("", {"data": "test"}, TYPE_AndruavMessage_DUMMY, True)

# receiver.py - Receives messages
def on_receive(message, length, jMsg):
    print(f"Received: {jMsg}")

cModule.m_OnReceive = on_receive
```

## Additional Resources

- **C++ Implementation**: [../client/src/de_common/README.md](../client/src/de_common/README.md)
- **C++ Examples**: [../client/test/README.md](../client/test/README.md)
- **DroneEngage Documentation**: Main repository documentation
- **Protocol Specification**: See `messages.py` for complete message definitions

## License

Part of the DroneEngage project. See main repository for license information.

## Support

For issues and questions:
- Check the main DroneEngage documentation
- Review the C++ implementation for reference
- Consult the protocol specification in the core library README

## Contributing

When contributing to the Python library:
1. Maintain compatibility with the C++ implementation
2. Follow Python PEP 8 style guidelines
3. Add type hints where appropriate
4. Include docstrings for public methods
5. Test with the DroneEngage communicator
